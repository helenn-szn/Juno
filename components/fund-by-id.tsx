"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { RiArrowRightUpLine, RiCheckboxCircleFill } from "@remixicon/react";
import { fundLearner, lookupLearner, type FundByIdState, type LookupResult } from "@/app/sponsor/actions";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { touchInput } from "@/components/touch-input";
import { explorer } from "@/lib/constants";

const FORMAT = /^JN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/;
const NOT_FOUND = "No learner with that ID. Check it and try again";

/**
 * Sponsor dashboard: type a learner's Juno ID, see her first name and course to be sure
 * it's her, then send USDC straight to her wallet.
 */
export function FundByIdForm() {
  const [state, action, pending] = useActionState<FundByIdState, FormData>(fundLearner, {});
  const [junoId, setJunoId] = useState("");
  const [found, setFound] = useState<LookupResult>();
  const [checking, setChecking] = useState(false);
  const latest = useRef("");

  // Look her up as soon as the ID is complete.
  function change(value: string) {
    const next = value.toUpperCase().replace(/\s/g, "").slice(0, 8);
    setJunoId(next);
    latest.current = next;
    setFound(undefined);
    if (!FORMAT.test(next)) return;
    setChecking(true);
    lookupLearner(next).then((result) => {
      if (latest.current !== next) return; // she kept typing
      setFound(result);
      setChecking(false);
    });
  }

  if (state.done) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-line p-5" aria-live="polite">
        <h2 className="text-title-3-medium">Fund a learner by ID</h2>
        <a
          href={explorer.tx(state.done.tx)}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-between gap-2 rounded-2xl bg-neon px-4 py-2.5 text-body-medium text-dark-green outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          Done! {state.done.amount.toFixed(2)} USDC is on its way to {state.done.name}.
          <span className="sr-only">View on Stellar</span>
          <RiArrowRightUpLine className="size-5 shrink-0" aria-hidden />
        </a>
        <a href="/sponsor" className="flex min-h-11 items-center text-body-medium text-green underline">Fund someone else</a>
      </div>
    );
  }

  const complete = FORMAT.test(junoId);
  const unknown = complete && found && !found.found;
  // Sent by hand (not as a form action) so a failed try doesn't wipe what she typed.
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-3.5 rounded-2xl border border-line p-5"
    >
      <h2 className="text-title-3-medium">Fund a learner by ID</h2>
      <Input
        name="junoId"
        label="Learner's Juno ID"
        placeholder="JN-XXXXX"
        value={junoId}
        onChange={change}
        autoComplete="off"
        isInvalid={Boolean(unknown)}
        errorMessage={NOT_FOUND}
        {...touchInput}
        inputClassName="h-11 font-mono tracking-[0.06em]"
      />
      <div aria-live="polite">
        {checking && <p className="text-body-2-regular text-text-secondary">Looking her up…</p>}
        {found?.found && (
          <div className="flex items-center gap-2.5 rounded-xl bg-mint px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple text-body-2-medium">{found.firstName.charAt(0).toUpperCase()}</span>
            <span className="min-w-0 flex-1 text-body-regular">
              <b className="font-medium">{found.firstName}</b> · {found.course ?? "hasn't started a course yet"}
            </span>
            <RiCheckboxCircleFill className="size-5 shrink-0 text-neon" aria-label="Learner found" />
          </div>
        )}
      </div>
      <Input name="amount" label="Amount (USDC)" inputMode="decimal" defaultValue="10.00" autoComplete="off" {...touchInput} />
      {state.error && <p role="alert" className="text-body-regular text-text-error-primary">{state.error}</p>}
      <Button type="submit" disabled={pending || !found?.found} className="h-11 rounded-full shadow-none">
        {pending ? "Sending…" : "Send to her wallet"}
      </Button>
    </form>
  );
}
