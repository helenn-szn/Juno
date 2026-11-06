"use client";

import { RiChat3Line } from "@remixicon/react";
import { Button, ButtonLink } from "@/components/base/buttons/button";

/** The nudge on her dashboard until she tells us her schedule: answer on a page, or chat with Juno.ai. */
export function PlanPrompt() {
  return (
    <section aria-labelledby="plan-prompt" className="on-dark flex flex-col gap-4 rounded-2xl bg-green p-5">
      <div className="flex flex-col gap-1">
        <h2 id="plan-prompt" className="text-title-3-medium">Make your courses fit your life</h2>
        <p className="text-copy-sm text-text-secondary">Tell us what you know and when you can study. It takes a minute.</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <ButtonLink href="/app/onboarding" className="h-11 rounded-full px-5 shadow-none">Set up my plan</ButtonLink>
        <Button
          variant="secondary"
          leadingIcon={RiChat3Line}
          onClick={() => window.dispatchEvent(new Event("juno-open"))}
          className="h-11 rounded-full border-radiant bg-transparent px-5 text-radiant shadow-none"
        >
          Chat with Juno.ai
        </Button>
      </div>
    </section>
  );
}
