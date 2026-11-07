"use server";
// Everything a learner does that changes data: create account, log in,
// log out, start a course. Each action checks the session itself.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { issueCertificate, recordOnStellar } from "@/lib/certificates";
import type { TopUpResult } from "@/app/sponsor/actions";
import { findCourse, requiredLessons } from "@/lib/courses";
import { profileSchema } from "@/lib/profile";
import { notify, usdc } from "@/lib/notifications";
import { claimSeat, findInvite, fundPending, linkInvite, sponsorsOf } from "@/lib/sponsoring";
import { currentUser, endSession, startSession } from "@/lib/session";
import { buyUsdc } from "@/lib/stellar";
import { Keypair } from "@stellar/stellar-sdk";
import { checkPassword, createUser, findUserByEmail, setUpWallet, updateUser } from "@/lib/users";

export type FormState = { errors?: Record<string, string>; values?: Record<string, string> };

function field(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

// Opens her wallet after the response is sent, so sign-up never waits on Stellar.
// Once it is open, any sponsor's budget waiting for her is sent.
function setUpWalletLater(userId: string) {
  after(async () => {
    try {
      await setUpWallet(userId);
      await fundPending(userId);
    } catch (error) {
      console.error("Wallet set-up failed:", error);
    }
  });
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const name = field(form, "name");
  const email = field(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Tell us your name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "That email doesn't look right.";
  else if (await findUserByEmail(email)) errors.email = "You already have an account. Log in instead?";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (Object.keys(errors).length) return { errors, values: { name, email } };

  const role = form.get("role") === "sponsor" ? "sponsor" : "learner";
  const user = await createUser(name, email, password, role);
  await startSession(user.id);
  // Signed up through a sponsor's invite link: she is that sponsor's learner.
  const invite = role === "learner" ? await findInvite(String(form.get("invite") ?? "")) : undefined;
  if (invite?.token) await linkInvite(invite.token, user.id);
  setUpWalletLater(user.id);
  await notify(
    user.id,
    role === "sponsor"
      ? { kind: "info", title: "Welcome to Juno", text: "Add some test USDC to your wallet, then invite a learner or open course seats.", href: "/sponsor/fund" }
      : { kind: "info", title: "Welcome to Juno", text: "Tell us when you can study and we'll plan your first course around you.", href: "/app/onboarding" },
  );
  redirect(role === "sponsor" ? "/sponsor" : invite ? `/app/courses/${invite.courseSlug}` : "/app");
}

export async function logIn(_: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email").toLowerCase();
  const user = await findUserByEmail(email);
  if (!user || !checkPassword(String(form.get("password") ?? ""), user.passwordHash)) {
    return { errors: { password: "That email and password don't match." }, values: { email } };
  }
  await startSession(user.id);
  setUpWalletLater(user.id); // opens her wallet if sign-up could not, and sends any waiting budget
  redirect(user.role === "sponsor" ? "/sponsor" : "/app");
}

export async function logOut() {
  await endSession();
  redirect("/");
}

export async function startCourse(slug: string) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!findCourse(slug)) return;
  // Before her first course we ask about her schedule and what she already knows.
  if (!user.profile) redirect(`/app/onboarding?next=${slug}`);
  if (!user.startedCourses.includes(slug)) {
    await updateUser(user.id, (u) => ({ ...u, startedCourses: [...u.startedCourses, slug] }));
  }
  // A sponsor may have paid for seats in this course: if one is free, it is hers.
  await claimSeat(user.id, slug);
  after(() => fundPending(user.id).catch((error) => console.error("Sponsored budget failed:", error)));
  redirect(`/app/courses/${slug}/learn`);
}

// She finishes a lesson. When the last lesson of her module is done the next module
// opens, and finishing the last module earns her certificate.
export async function completeLesson(slug: string, lessonIndex: number) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const course = findCourse(slug);
  if (!course) return;

  const done = user.modulesDone?.[slug] ?? 0;
  const unit = course.modules[done];
  if (!unit || !unit.lessons[lessonIndex] || unit.lessons[lessonIndex].kind === "review") return;

  const lessons = [...new Set([...(user.lessonsDone?.[slug] ?? []), lessonIndex])];
  const moduleFinished = requiredLessons(unit).every((index) => lessons.includes(index));
  await updateUser(user.id, (u) => ({
    ...u,
    startedCourses: u.startedCourses.includes(slug) ? u.startedCourses : [...u.startedCourses, slug],
    modulesDone: { ...u.modulesDone, [slug]: moduleFinished ? done + 1 : done },
    lessonsDone: { ...u.lessonsDone, [slug]: moduleFinished ? [] : lessons },
  }));
  revalidatePath("/app", "layout");

  if (moduleFinished) {
    await notify(user.id, { kind: "skill", title: "Skill minted. That's yours forever.", text: `You finished “${unit.title}” in ${course.title}.`, href: `/app/courses/${slug}` });
  }
  if (moduleFinished && done + 1 === course.modules.length) {
    const certificate = await issueCertificate(user, course);
    await notify(user.id, { kind: "skill", title: "Your certificate is ready", text: `You finished ${course.title}. Download it or share the link.`, href: `/app/certificates/${certificate.id}` });
    for (const sponsorId of await sponsorsOf(user.id)) {
      await notify(sponsorId, { kind: "skill", title: "A learner is certified", text: `${user.name.split(" ")[0]} finished ${course.title} and earned her certificate.`, href: "/sponsor#learners" });
    }
    after(() => recordOnStellar(certificate.id).catch((error) => console.error("Certificate record failed:", error)));
    redirect(`/app/certificates/${certificate.id}`);
  }
}

// Saves what she told us about herself, then carries on to the course she wanted
// (or her dashboard). The same answers can be given to Juno.ai in the chat.
export async function saveProfile(next: string | undefined, _: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect("/login");
  const parsed = profileSchema.safeParse({
    experience: form.get("experience"),
    goal: form.get("goal"),
    background: field(form, "background"),
    hoursPerWeek: Number(form.get("hoursPerWeek")),
    days: form.getAll("days"),
    time: form.get("time"),
  });
  if (!parsed.success) return { errors: { form: "Something is missing. Check each step and try again." } };

  await updateUser(user.id, (u) => ({ ...u, profile: parsed.data }));
  revalidatePath("/app", "layout");
  if (next && findCourse(next)) await startCourse(next); // redirects into the course
  redirect("/app");
}

// She adds test USDC to her own learning wallet: some of its free test XLM is swapped for USDC
// on Stellar's built-in exchange. A sponsor can fund her too; this is for when she wants to herself.
export async function fundMyWallet(amount: number): Promise<TopUpResult> {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.wallet) return { ok: false, reason: "no-wallet" };
  if (![10, 20, 50].includes(amount)) return { ok: false, reason: "failed" };
  try {
    const tx = await buyUsdc(Keypair.fromSecret(user.wallet.secret), amount);
    await notify(user.id, { kind: "paid", title: "Wallet topped up", text: `${usdc(amount)} is in your learning wallet.`, tx, href: "/app/wallet" });
    revalidatePath("/app", "layout");
    return { ok: true, tx };
  } catch (error) {
    console.error("Funding her own wallet failed:", error);
    // A brand-new wallet takes a little while to open on the network.
    const missing = (error as { response?: { status?: number } })?.response?.status === 404;
    return { ok: false, reason: missing ? "no-wallet" : error instanceof Error && error.message === "no-liquidity" ? "no-liquidity" : "failed" };
  }
}
