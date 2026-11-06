// The paid service. Without payment it answers 402 with the price;
// with a valid payment the mentor is paid and the review is booked.
import { NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { MENTOR_REVIEW_PRICE, NETWORK } from "@/lib/constants";
import { wallet } from "@/lib/stellar";
import { x402Server } from "@/lib/x402";

const mentor = wallet("mentor");

const review = async () =>
  NextResponse.json({
    mentor: "Zainab",
    message: "Done! Mentor paid. Your review is on its way.",
  });

export const GET =
  mentor && x402Server
  ? withX402(
      review,
      {
        accepts: { scheme: "exact", price: `$${MENTOR_REVIEW_PRICE}`, network: NETWORK, payTo: mentor.publicKey() },
        description: "Mentor review of your logo design",
      },
      x402Server,
    )
  : // Fail closed: never give the review away free if wallets aren't set up.
    () => NextResponse.json({ error: "Run npm run setup first" }, { status: 503 });
