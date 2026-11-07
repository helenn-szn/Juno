// Her study agent pays for a mentor review. The page calls this after she says yes.
// If her own wallet can cover it (a sponsor's budget, or USDC she added herself), it pays, and a
// sponsor sees it. Otherwise the shared demo wallet pays.
import { NextResponse } from "next/server";
import { MENTOR_REVIEW_PRICE } from "@/lib/constants";
import { currentUser } from "@/lib/session";
import { recordReview } from "@/lib/sponsoring";
import { usdcBalanceOrZero } from "@/lib/stellar";
import { payForMentorReview } from "@/lib/x402";

// Stellar can take a while; Vercel stops functions after 10 seconds by default.
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, reason: "failed" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const course = typeof body?.course === "string" ? body.course : "";

  const price = Number(MENTOR_REVIEW_PRICE);
  const own = user.wallet && (await usdcBalanceOrZero(user.wallet.publicKey)) >= price ? user.wallet.secret : undefined;
  const payment = await payForMentorReview(new URL("/api/mentor-review", request.url), own);
  if (payment.ok && own) await recordReview(user.id, course, price, payment.transaction).catch((error) => console.error("Review not recorded:", error));
  return NextResponse.json(payment, { status: payment.ok ? 200 : 400 });
}
