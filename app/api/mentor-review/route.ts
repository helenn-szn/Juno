// The paid service. Without payment it answers 402 with the price;
// with a valid payment the mentor is paid and the review is booked.
//   /api/mentor-review?request=<id>  → the price and mentor wallet of that review request
//   /api/mentor-review               → the demo mentor at the fixed demo price (used when no real mentor exists yet)
import { NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { MENTOR_REVIEW_PRICE, NETWORK } from "@/lib/constants";
import { findRequest } from "@/lib/mentors";
import { wallet } from "@/lib/stellar";
import { findUserById } from "@/lib/users";
import { x402Server } from "@/lib/x402";

// Stellar can take a while; Vercel stops functions after 10 seconds by default.
export const maxDuration = 60;

const demoMentor = wallet("mentor");

type Asker = { getQueryParam?: (name: string) => string | string[] | undefined };

// Who gets paid and how much comes from the request, never from the caller.
async function terms(adapter: Asker) {
  const id = adapter.getQueryParam?.("request");
  if (typeof id !== "string") return demoMentor ? { payTo: demoMentor.publicKey(), price: MENTOR_REVIEW_PRICE, mentor: "Zainab" } : undefined;
  const request = await findRequest(id);
  const mentor = request && request.status === "requested" ? await findUserById(request.mentorUserId) : undefined;
  if (!request || !mentor?.wallet) return undefined;
  return { payTo: mentor.wallet.publicKey, price: request.price.toFixed(2), mentor: mentor.name.split(" ")[0] };
}

const review = async (request: Request) => {
  const found = await terms({ getQueryParam: (name) => new URL(request.url).searchParams.get(name) ?? undefined });
  return NextResponse.json({ mentor: found?.mentor ?? "Your mentor", message: "Done! Mentor paid. Your review is on its way." });
};

export const GET = x402Server
  ? withX402(
      review,
      {
        accepts: {
          scheme: "exact",
          price: async (context) => `$${(await terms(context.adapter))?.price ?? "999999"}`, // a request that doesn't exist can't be paid
          network: NETWORK,
          payTo: async (context) => (await terms(context.adapter))?.payTo ?? "",
        },
        description: "Mentor review of your work",
      },
      x402Server,
    )
  : // Fail closed: never give the review away free if wallets aren't set up.
    () => NextResponse.json({ error: "Run npm run setup first" }, { status: 503 });
