"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightUpLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import type { Payment } from "@/lib/x402";
import { MENTOR_REVIEW_PRICE, explorer } from "@/lib/constants";

const problems = {
  setup: "Wallets aren't set up yet. Run npm run setup.",
  "low-balance": "Your wallet is running low. Ask your sponsor for a top-up?",
  failed: "That didn't go through. Try again?",
};

export function MentorReview() {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment>();
  const [paying, startPaying] = useTransition();

  const pay = () =>
    startPaying(async () => {
      const res = await fetch("/api/pay", { method: "POST" });
      setPayment(await res.json().catch(() => ({ ok: false, reason: "failed" })));
      router.refresh();
    });

  if (payment?.ok) {
    return (
      <a
        href={explorer.tx(payment.transaction)}
        target="_blank"
        rel="noreferrer"
        aria-live="polite"
        className="flex h-9 items-center justify-between gap-4 rounded-2lg px-5 text-body-medium text-text-paid outline-none hover:bg-background-primary-default focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        {payment.review.message}
        <span className="sr-only">View on Stellar</span>
        <RiArrowRightUpLine className="size-5 shrink-0 text-text-proof" aria-hidden />
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={pay} disabled={paying} className="w-full">
        {paying ? "Paying mentor…" : `Get a mentor review · ${MENTOR_REVIEW_PRICE} USDC`}
      </Button>
      {payment && (
        <p className="px-5 text-body-regular text-text-secondary" aria-live="polite">
          {problems[payment.reason]}
        </p>
      )}
    </div>
  );
}
