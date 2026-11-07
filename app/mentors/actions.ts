"use server";
// Everything a mentor does: apply, accept or decline a request, deliver it, pause requests,
// change prices, withdraw. Each action checks the session itself.
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import type { FormState } from "@/app/actions";
import { findCourse, courses } from "@/lib/courses";
import { changeRequest, findRequest, mintSkillCoin } from "@/lib/mentors";
import { FORMAT_KEYS, FORMATS, HOURS, priceProblem, type Format, type MentorProfile } from "@/lib/mentors-shared";
import { notify, usdc } from "@/lib/notifications";
import { currentUser, startSession } from "@/lib/session";
import { recordReview, sponsorsOf } from "@/lib/sponsoring";
import { sendUsdc, usdcBalance, usdcBalanceOrZero } from "@/lib/stellar";
import { createUser, findUserByEmail, findUserById, newUniqueMentorId, setUpWallet, updateUser } from "@/lib/users";
import { payForMentorReview } from "@/lib/x402";

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

/** The prices she turned on, and a message under every price that is out of range. */
function readPrices(form: FormData) {
  const prices: Partial<Record<Format, number>> = {};
  const errors: Record<string, string> = {};
  for (const format of FORMAT_KEYS) {
    if (form.get(`offer_${format}`) !== "on") continue;
    const value = text(form, `price_${format}`);
    const problem = priceProblem(format, value);
    if (problem) errors[`price_${format}`] = problem;
    else prices[format] = Math.round(Number(value.replace(",", ".")) * 100) / 100;
  }
  if (!Object.keys(prices).length && !Object.keys(errors).length) errors.prices = "Turn on at least one format.";
  return { prices, errors };
}

/** Sign up as a mentor (or, if she was asked for changes, update her application). Her wallet opens in the background. */
export async function applyAsMentor(_: FormState, form: FormData): Promise<FormState> {
  const me = await currentUser();
  const again = me?.role === "mentor" ? me : undefined; // a mentor asked for changes sends the form again
  if (me && !again) redirect("/app");

  const name = again?.name ?? text(form, "name");
  const email = again?.email ?? text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const country = text(form, "country");
  const bio = text(form, "bio");
  const link = text(form, "link");
  const picked = form.getAll("courses").map(String).filter((slug) => findCourse(slug));
  const { prices, errors } = readPrices(form);

  if (!name) errors.name = "Tell us your name.";
  if (!again) {
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "That email doesn't look right.";
    else if (await findUserByEmail(email)) errors.email = "You already have an account. Log in instead?";
    if (password.length < 8) errors.password = "Use at least 8 characters.";
  }
  if (!country) errors.country = "Tell us where you are.";
  if (!picked.length) errors.courses = "Pick at least one course you can review.";
  if (bio.length < 20) errors.bio = "Tell learners a little about you (20 characters or more).";
  if (!/^https?:\/\/\S+\.\S+/.test(link)) errors.link = "Add a link that starts with https://";
  if (form.get("promise_reply") !== "on" || form.get("promise_teach") !== "on") errors.agree = "Please agree to both promises to submit.";

  const values: Record<string, string> = { name, email, country, bio, link, ...Object.fromEntries(FORMAT_KEYS.flatMap((f) => [[`price_${f}`, text(form, `price_${f}`)], [`offer_${f}`, String(form.get(`offer_${f}`) ?? "")]])) };
  if (Object.keys(errors).length) return { errors, values: { ...values, courses: picked.join(",") } };

  const profile: MentorProfile = {
    mentorId: again?.mentor?.mentorId ?? (await newUniqueMentorId()),
    country,
    bio,
    link,
    courses: picked,
    prices,
    status: "review",
    takingRequests: again?.mentor?.takingRequests ?? true,
    submittedAt: new Date().toISOString(),
    withdrawals: again?.mentor?.withdrawals,
  };
  let id = again?.id;
  if (again) await updateUser(again.id, (u) => ({ ...u, mentor: profile }));
  else {
    const user = await createUser(name, email, password, "mentor", profile);
    id = user.id;
    await startSession(user.id);
    await notify(user.id, { kind: "info", title: "Application sent", text: "The Juno team checks your link and skills, usually within two days.", href: "/app" });
  }
  after(() => setUpWallet(id!).catch((error) => console.error("Mentor wallet set-up failed:", error)));
  redirect("/app");
}

export type MentorResult = { ok: true; tx?: string } | { ok: false; reason: string };

async function approvedMentor() {
  const user = await currentUser();
  if (!user || user.role !== "mentor") redirect("/login");
  if (user.mentor?.status !== "approved") redirect("/app");
  return user;
}

/** Accept: her wallet receives the money the moment she says yes. The learner's agent pays with x402. */
export async function acceptRequest(id: string): Promise<MentorResult> {
  const mentor = await approvedMentor();
  const request = await findRequest(id);
  if (!request || request.mentorUserId !== mentor.id) return { ok: false, reason: "That request is gone." };
  if (request.status === "expired") return { ok: false, reason: "That request ran out of time. No money moved." };
  if (request.status !== "requested") return { ok: false, reason: "That request was already answered." };

  // Her wallet must be open on the network, or she can't receive.
  if (!mentor.wallet || !(await usdcBalance(mentor.wallet.publicKey).then(() => true, () => false))) {
    after(() => setUpWallet(mentor.id).catch(() => {}));
    return { ok: false, reason: "Your wallet is still opening. Try again in a minute." };
  }
  const learner = await findUserById(request.learnerId);
  // The learner's own wallet pays when it can (a sponsor's budget, or USDC she added); otherwise the shared demo wallet does.
  const own = learner?.wallet && (await usdcBalanceOrZero(learner.wallet.publicKey)) >= request.price ? learner.wallet.secret : undefined;
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const payment = await payForMentorReview(new URL(`/api/mentor-review?request=${id}`, origin), own, request.price);
  if (!payment.ok) {
    return { ok: false, reason: payment.reason === "low-balance" ? "Her wallet is running low. She'll need a top-up first." : "The payment didn't go through and nothing was charged. Try again?" };
  }

  const now = Date.now();
  await changeRequest(id, (r) => ({ ...r, status: "accepted", acceptedAt: new Date(now).toISOString(), dueAt: new Date(now + 48 * HOURS).toISOString(), payTx: payment.transaction }));
  await notify(request.learnerId, {
    kind: "paid",
    title: "Done! Mentor paid.",
    text: `${mentor.name.split(" ")[0]} said yes. Your review is on its way. ${usdc(request.price)}${own ? " came from your wallet." : "."}`,
    tx: payment.transaction,
    href: `/app/courses/${request.courseSlug}/learn`,
  });
  await notify(mentor.id, { kind: "paid", title: "You were paid", text: `${request.learnerName} · ${FORMATS[request.format].label.toLowerCase()} · +${usdc(request.price)}`, tx: payment.transaction, href: "/app#progress" });
  if (own) await recordReview(request.learnerId, request.courseSlug, request.price, payment.transaction).catch((error) => console.error("Review not recorded:", error));
  revalidatePath("/app");
  return { ok: true, tx: payment.transaction };
}

/** Decline: no money moves, and the learner is told so her agent can offer someone else. */
export async function declineRequest(id: string): Promise<MentorResult> {
  const mentor = await approvedMentor();
  const request = await findRequest(id);
  if (!request || request.mentorUserId !== mentor.id || request.status !== "requested") return { ok: false, reason: "That request was already answered." };
  await changeRequest(id, (r) => ({ ...r, status: "declined" }));
  await notify(request.learnerId, {
    kind: "info",
    title: "A mentor can't take it",
    text: `${mentor.name.split(" ")[0]} can't take this one. You weren't charged. Ask your study agent for another mentor.`,
    href: `/app/courses/${request.courseSlug}/learn`,
  });
  revalidatePath("/app");
  return { ok: true };
}

/** Send the review and mark it done: this mints the learner's skill coin on Stellar. */
export async function deliverRequest(id: string, _: FormState, form: FormData): Promise<FormState> {
  const mentor = await approvedMentor();
  const request = await findRequest(id);
  if (!request || request.mentorUserId !== mentor.id || request.status !== "accepted") return { errors: { form: "That review isn't open any more." } };

  const note = text(form, "text");
  const link = text(form, "link");
  const when = text(form, "when");
  const errors: Record<string, string> = {};
  if (request.format === "written" && note.length < 10) errors.text = "Write your feedback for her.";
  if (request.format !== "written" && !/^https?:\/\/\S+\.\S+/.test(link)) errors.link = request.format === "voice" ? "Add a link to your voice note." : "Add your meeting link.";
  if (request.format === "call" && !when) errors.when = "Pick a time for the call.";
  if (Object.keys(errors).length) return { errors, values: { text: note, link, when } };

  const skillTx = await mintSkillCoin(id).catch((error) => {
    console.error("Skill coin failed:", error);
    return undefined;
  });
  await changeRequest(id, (r) => ({ ...r, status: "delivered", deliveredAt: new Date().toISOString(), delivery: { text: note, ...(link ? { link } : {}), ...(when ? { when } : {}) }, skillTx }));
  const course = findCourse(request.courseSlug);
  await notify(request.learnerId, {
    kind: "skill",
    title: "Skill minted. That's yours forever.",
    text: `${mentor.name.split(" ")[0]} finished your review in ${course?.title ?? "your course"}.`,
    tx: skillTx,
    href: `/app/courses/${request.courseSlug}/learn`,
  });
  for (const sponsorId of await sponsorsOf(request.learnerId)) {
    await notify(sponsorId, { kind: "skill", title: "A skill coin was minted", text: `${request.learnerName}'s mentor review is done.`, tx: skillTx, href: "/sponsor#payments" });
  }
  revalidatePath("/app");
  return {};
}

export async function setTakingRequests(on: boolean) {
  const user = await approvedMentor();
  await updateUser(user.id, (u) => ({ ...u, mentor: u.mentor && { ...u.mentor, takingRequests: on } }));
  revalidatePath("/app", "layout");
}

export async function dismissWelcome() {
  const user = await approvedMentor();
  await updateUser(user.id, (u) => ({ ...u, mentor: u.mentor && { ...u.mentor, welcomed: true } }));
  revalidatePath("/app");
}

/** Edit prices (and the courses she reviews) from her dashboard. */
export async function saveMentorPrices(_: FormState, form: FormData): Promise<FormState> {
  const user = await approvedMentor();
  const { prices, errors } = readPrices(form);
  const picked = form.getAll("courses").map(String).filter((slug) => courses.some((c) => c.slug === slug));
  if (!picked.length) errors.courses = "Pick at least one course you can review.";
  if (Object.keys(errors).length) return { errors };
  await updateUser(user.id, (u) => ({ ...u, mentor: u.mentor && { ...u.mentor, prices, courses: picked } }));
  revalidatePath("/app", "layout");
  return { values: { saved: "1" } };
}

/** Send USDC from the mentor wallet to a wallet she owns (for example the one she connected). */
export async function withdraw(address: string, amount: number): Promise<MentorResult> {
  const user = await approvedMentor();
  if (!user.wallet) return { ok: false, reason: "Your wallet is still opening. Try again in a minute." };
  if (!StrKey.isValidEd25519PublicKey(address)) return { ok: false, reason: "That doesn't look like a Stellar address. It starts with G." };
  if (!(amount > 0)) return { ok: false, reason: "Enter an amount above 0." };
  if (amount > (await usdcBalanceOrZero(user.wallet.publicKey))) return { ok: false, reason: "That's more than you have." };
  try {
    const tx = await sendUsdc(Keypair.fromSecret(user.wallet.secret), address, amount);
    await updateUser(user.id, (u) => ({ ...u, mentor: u.mentor && { ...u.mentor, withdrawals: [{ at: new Date().toISOString(), amount, tx }, ...(u.mentor.withdrawals ?? [])] } }));
    await notify(user.id, { kind: "paid", title: "Withdrawn", text: `${usdc(amount)} was sent to your wallet.`, tx });
    revalidatePath("/app");
    return { ok: true, tx };
  } catch (error) {
    console.error("Withdraw failed:", error);
    return { ok: false, reason: "That wallet can't receive USDC yet. Add USDC to it first, then try again." };
  }
}
