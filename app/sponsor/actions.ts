"use server";
// What a sponsor does: top up her wallet, invite a learner, fund course seats.
// Each action checks that the signed-in person is a sponsor.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Keypair } from "@stellar/stellar-sdk";
import { findCourse } from "@/lib/courses";
import { currentUser } from "@/lib/session";
import { addSeats, committedBudget, createInvite, recordDirect, recordTopUp } from "@/lib/sponsoring";
import { buyUsdc, sendUsdc, usdcBalanceOrZero } from "@/lib/stellar";
import { JUNO_ID_PATTERN, findUserByJunoId, setUpWallet } from "@/lib/users";

export type SponsorFormState = { error?: string; token?: string; done?: boolean };
export type TopUpResult = { ok: true; tx: string } | { ok: false; reason: "no-wallet" | "no-liquidity" | "failed" };

async function sponsor() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "sponsor") redirect("/app");
  return user;
}

// How much she can still promise: her balance minus what is already promised.
async function available(wallet: { publicKey: string }, sponsorId: string) {
  return (await usdcBalanceOrZero(wallet.publicKey)) - (await committedBudget(sponsorId));
}

const LOW = "Your wallet doesn't have enough for that yet. Top up first?";

export async function topUp(amount: number): Promise<TopUpResult> {
  const user = await sponsor();
  if (!user.wallet) return { ok: false, reason: "no-wallet" };
  if (![20, 50, 100].includes(amount)) return { ok: false, reason: "failed" };
  try {
    const tx = await buyUsdc(Keypair.fromSecret(user.wallet.secret), amount);
    await recordTopUp(user.id, amount, tx);
    revalidatePath("/sponsor", "layout");
    return { ok: true, tx };
  } catch (error) {
    console.error("Top up failed:", error);
    // A brand-new wallet takes a little while to open on the network.
    const missing = (error as { response?: { status?: number } })?.response?.status === 404;
    return { ok: false, reason: missing ? "no-wallet" : error instanceof Error && error.message === "no-liquidity" ? "no-liquidity" : "failed" };
  }
}

function readCourseAndBudget(form: FormData) {
  const course = findCourse(String(form.get("course") ?? ""));
  const budget = Number(form.get("budget"));
  return { course, budget: Number.isFinite(budget) && budget >= 1 && budget <= 100 ? budget : 0 };
}

export async function inviteLearner(_: SponsorFormState, form: FormData): Promise<SponsorFormState> {
  const user = await sponsor();
  const { course, budget } = readCourseAndBudget(form);
  const label = String(form.get("label") ?? "").trim().slice(0, 80);
  if (!course || !budget) return { error: "Pick a course and a budget between 1 and 100 USDC." };
  if (!user.wallet || (await available(user.wallet, user.id)) < budget) return { error: LOW };
  const invite = await createInvite(user.id, label, course.slug, budget);
  revalidatePath("/sponsor", "layout");
  return { token: invite.token, done: true };
}

export async function fundSeats(_: SponsorFormState, form: FormData): Promise<SponsorFormState> {
  const user = await sponsor();
  const { course, budget } = readCourseAndBudget(form);
  const seats = Math.floor(Number(form.get("seats")));
  if (!course || !budget || !(seats >= 1 && seats <= 20)) return { error: "Pick a course, 1 to 20 seats and a budget between 1 and 100 USDC." };
  if (!user.wallet || (await available(user.wallet, user.id)) < budget * seats) return { error: LOW };
  await addSeats(user.id, course.slug, seats, budget);
  revalidatePath("/sponsor", "layout");
  redirect("/sponsor#seats");
}

// --- Fund a learner by her Juno ID ---------------------------------------------------

export type LookupResult = { found: true; firstName: string; course: string | null } | { found: false };
export type FundByIdState = { error?: string; done?: { name: string; tx: string; amount: number } };

const NOT_FOUND = "No learner with that ID. Check it and try again";

// Only what a sponsor needs to be sure it's the right woman: her first name and course. Never her email.
async function learnerById(junoId: string) {
  const learner = await findUserByJunoId(junoId.trim().toUpperCase());
  return learner && learner.role !== "sponsor" ? learner : undefined;
}

export async function lookupLearner(junoId: string): Promise<LookupResult> {
  await sponsor();
  if (!JUNO_ID_PATTERN.test(junoId.trim().toUpperCase())) return { found: false };
  const learner = await learnerById(junoId);
  if (!learner) return { found: false };
  const slug = learner.startedCourses.at(-1);
  return { found: true, firstName: learner.name.split(" ")[0], course: slug ? (findCourse(slug)?.title ?? null) : null };
}

export async function fundLearner(_: FundByIdState, form: FormData): Promise<FundByIdState> {
  const user = await sponsor();
  const learner = await learnerById(String(form.get("junoId") ?? ""));
  if (!learner) return { error: NOT_FOUND };

  const text = String(form.get("amount") ?? "").trim().replace(",", ".");
  const amount = /^\d+(\.\d{1,2})?$/.test(text) ? Number(text) : 0;
  if (!(amount > 0)) return { error: "Enter an amount more than 0." };
  if (!user.wallet) return { error: "Your wallet is still being set up. Try again in a moment." };
  if (amount > (await usdcBalanceOrZero(user.wallet.publicKey))) return { error: "That's more than your wallet holds. Top up first?" };

  try {
    await setUpWallet(learner.id); // her wallet must be open and able to hold USDC
    const fresh = (await learnerById(String(form.get("junoId"))))!;
    const tx = await sendUsdc(Keypair.fromSecret(user.wallet.secret), fresh.wallet!.publicKey, amount);
    await recordDirect(user.id, fresh.id, amount, tx);
    revalidatePath("/sponsor", "layout");
    return { done: { name: fresh.name.split(" ")[0], tx, amount } };
  } catch (error) {
    console.error("Fund by ID failed:", error);
    return { error: "That didn't go through, and nothing was sent. Try again?" };
  }
}
