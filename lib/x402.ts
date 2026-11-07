// x402 in Juno, both sides of the counter.
//
// Seller side: `x402Server` lets an API route ask for payment (HTTP 402).
// The facilitator checks a payment and puts it on Stellar. We run the official
// one from @x402/stellar inside the app (no hosted service to time out), and
// the juno wallet pays the network fee. We never write that logic ourselves.
//
// Buyer side: `payForMentorReview` is Ada's agent paying from her wallet.
// It runs on the server because a browser can't sign Stellar payments alone.
import "server-only";
import { Keypair } from "@stellar/stellar-sdk";
import { x402Facilitator } from "@x402/core/facilitator";
import type { SupportedResponse } from "@x402/core/types";
import { decodePaymentResponseHeader, wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { x402ResourceServer } from "@x402/next";
import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme as ClientScheme } from "@x402/stellar/exact/client";
import { ExactStellarScheme as FacilitatorScheme } from "@x402/stellar/exact/facilitator";
import { ExactStellarScheme as ServerScheme } from "@x402/stellar/exact/server";
import { MENTOR_REVIEW_PRICE, NETWORK } from "./constants";
import { usdcBalance, wallet } from "./stellar";

const juno = wallet("juno");

const facilitator =
  juno &&
  new x402Facilitator().register(NETWORK, new FacilitatorScheme([createEd25519Signer(juno.secret(), NETWORK)]));

export const x402Server =
  facilitator &&
  new x402ResourceServer({
    verify: (payload, requirements) => facilitator.verify(payload, requirements),
    settle: (payload, requirements) => facilitator.settle(payload, requirements),
    getSupported: async () => facilitator.getSupported() as SupportedResponse,
  }).register(NETWORK, new ServerScheme());

export type Payment =
  | { ok: true; transaction: string; review: { mentor: string; message: string } }
  | { ok: false; reason: "setup" | "low-balance" | "failed" };

// `payerSecret` is the learner's own wallet; without it the shared demo wallet pays.
export async function payForMentorReview(url: string | URL, payerSecret?: string, price = Number(MENTOR_REVIEW_PRICE)): Promise<Payment> {
  try {
    return await pay(url, payerSecret, price);
  } catch (error) {
    // A network hiccup should read as a friendly "try again", never a server error.
    console.error("Mentor review payment error:", error);
    return { ok: false, reason: "failed" };
  }
}

async function pay(url: string | URL, payerSecret: string | undefined, price: number): Promise<Payment> {
  const learner = payerSecret ? Keypair.fromSecret(payerSecret) : wallet("learner");
  if (!learner) return { ok: false, reason: "setup" };
  if ((await usdcBalance(learner.publicKey())) < price) {
    return { ok: false, reason: "low-balance" };
  }

  const payingFetch = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [{ network: NETWORK, client: new ClientScheme(createEd25519Signer(learner.secret(), NETWORK)) }],
  });
  const res = await payingFetch(url);
  const receipt = res.headers.get("PAYMENT-RESPONSE");
  if (!res.ok || !receipt) {
    console.error("Mentor review payment failed:", res.status, await res.text());
    return { ok: false, reason: "failed" };
  }
  return { ok: true, transaction: decodePaymentResponseHeader(receipt).transaction, review: await res.json() };
}
