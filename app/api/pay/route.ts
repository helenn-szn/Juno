// Ada's agent pays for a mentor review. The page calls this after Ada says yes.
import { NextResponse } from "next/server";
import { payForMentorReview } from "@/lib/x402";

export async function POST(request: Request) {
  const payment = await payForMentorReview(new URL("/api/mentor-review", request.url));
  return NextResponse.json(payment, { status: payment.ok ? 200 : 400 });
}
