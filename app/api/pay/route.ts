// Her study agent books a mentor review. The page calls this after she says yes.
// With a real mentor for the course, this sends the request and nothing is paid yet: the mentor
// accepts (and is paid, by x402, from her wallet) in app/mentors/actions.ts.
// With no mentor yet, the shared demo mentor is paid straight away, as in the first demo.
import { NextResponse } from "next/server";
import { MENTOR_REVIEW_PRICE } from "@/lib/constants";
import { findCourse } from "@/lib/courses";
import { createRequest } from "@/lib/mentors";
import { currentUser } from "@/lib/session";
import { notify } from "@/lib/notifications";
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
  const reason = typeof body?.reason === "string" ? body.reason.slice(0, 400) : "";

  // A real mentor takes it: send the request. She pays only once the mentor says yes.
  const lesson = findCourse(course)?.modules[user.modulesDone?.[course] ?? 0]?.title ?? "";
  const sent = await createRequest(user, course, lesson, reason || "She is stuck and would like a mentor to look at her work.");
  if (sent) {
    return NextResponse.json({ ok: true, requested: true, mentor: sent.mentor.name.split(" ")[0], format: sent.request.format, price: sent.request.price });
  }

  const price = Number(MENTOR_REVIEW_PRICE);
  const own = user.wallet && (await usdcBalanceOrZero(user.wallet.publicKey)) >= price ? user.wallet.secret : undefined;
  const payment = await payForMentorReview(new URL("/api/mentor-review", request.url), own);
  if (payment.ok) {
    await notify(user.id, {
      kind: "paid",
      title: "Done! Mentor paid.",
      text: own ? `Your review is on its way. ${price.toFixed(2)} USDC came from your wallet.` : "Your review is on its way.",
      tx: payment.transaction,
    });
  }
  if (payment.ok && own) await recordReview(user.id, course, price, payment.transaction).catch((error) => console.error("Review not recorded:", error));
  return NextResponse.json(payment, { status: payment.ok ? 200 : 400 });
}
