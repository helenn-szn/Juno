"use server";
// What a sponsor does: top up her wallet, invite a learner, fund course seats.
// Each action checks that the signed-in person is a sponsor.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Keypair } from "@stellar/stellar-sdk";
import { findCourse } from "@/lib/courses";
import { currentUser } from "@/lib/session";
import { addSeats, committedBudget, createInvite, recordTopUp } from "@/lib/sponsoring";
import { buyUsdc, usdcBalanceOrZero } from "@/lib/stellar";

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
