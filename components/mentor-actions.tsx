"use client";

import { useActionState, useState, useTransition } from "react";
import { Form } from "react-aria-components";
import { RiArrowDownLine, RiArrowRightUpLine, RiCheckLine, RiCloseLine } from "@remixicon/react";
import type { FormState } from "@/app/actions";
import { acceptRequest, declineRequest, deliverRequest, dismissWelcome, setTakingRequests, withdraw, type MentorResult } from "@/app/mentors/actions";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { touchInput } from "@/components/touch-input";
import { explorer } from "@/lib/constants";
import type { Format } from "@/lib/mentors-shared";
import { cx } from "@/utils/cx";

const pill = "h-11 rounded-full px-5 shadow-none";

/** "Taking requests": pauses new requests when off. */
export function TakingSwitch({ on }: { on: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState(on);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      disabled={pending}
      onClick={() => {
        setOptimistic(!optimistic);
        start(() => setTakingRequests(!optimistic));
      }}
      className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line px-3.5 text-body-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
    >
      <span className={cx("relative h-5.5 w-9 rounded-full", optimistic ? "bg-neon" : "bg-field-border")} aria-hidden>
        <span className={cx("absolute top-0.75 size-4 rounded-full bg-dark-green transition-all", optimistic ? "end-0.75" : "start-0.75")} />
      </span>
      Taking requests
    </button>
  );
}

export function WelcomeBanner({ name, courses }: { name: string; courses: string }) {
  const [, start] = useTransition();
  return (
    <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-paper-line bg-mint px-5 py-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neon text-dark-green"><RiCheckLine className="size-4" aria-hidden /></span>
      <div className="flex min-w-0 grow basis-65 flex-col gap-0.5">
        <span className="text-body-medium">You&apos;re approved, {name}. Welcome to Juno.</span>
        <span className="text-copy-sm text-ink-muted">Learners in {courses} can now book you.</span>
      </div>
      <button type="button" aria-label="Dismiss" onClick={() => start(() => dismissWelcome())} className="flex size-11 items-center justify-center rounded-full text-ink-muted outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <RiCloseLine className="size-5" aria-hidden />
      </button>
    </div>
  );
}

/** Accept and get paid, or decline. Accepting runs the x402 payment, so it can take a little while. */
export function AnswerButtons({ id, price }: { id: string; price: string }) {
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<"accept" | "decline">();
  const [result, setResult] = useState<MentorResult>();

  const run = (kind: "accept" | "decline") =>
    start(async () => {
      setWhich(kind);
      setResult(kind === "accept" ? await acceptRequest(id) : await declineRequest(id));
    });

  if (result?.ok && which === "accept" && result.tx) {
    return (
      <a href={explorer.tx(result.tx)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-neon px-4 text-body-medium text-dark-green outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        Paid +{price} USDC · View on Stellar <RiArrowRightUpLine className="size-4" aria-hidden />
      </a>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button className={pill} disabled={pending} onClick={() => run("accept")}>{pending && which === "accept" ? "Getting paid…" : "Accept and get paid"}</Button>
        <Button variant="secondary" className={pill} disabled={pending} onClick={() => run("decline")}>{pending && which === "decline" ? "Declining…" : "Decline"}</Button>
      </div>
      <div aria-live="polite" className="text-body-regular">
        {pending && which === "accept" && <span className="text-text-secondary">Her agent is paying you. This can take up to a minute.</span>}
        {result && !result.ok && <span className="text-text-error-primary">{result.reason}</span>}
      </div>
    </div>
  );
}

/** The delivery box, by format: written feedback, a voice note link, or a meeting link and time. Sending it marks the review done. */
export function DeliveryBox({ id, format, learner }: { id: string; format: Format; learner: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(deliverRequest.bind(null, id), {});
  return (
    <Form action={action} validationBehavior="aria" validationErrors={state.errors} className="flex flex-col gap-4">
      {format === "written" ? (
        <label className="flex flex-col gap-1.5 text-body-medium">
          Your feedback
          <textarea name="text" rows={4} defaultValue={state.values?.text} aria-invalid={state.errors?.text ? true : undefined} />
          {state.errors?.text && <span role="alert" className="text-body-regular font-normal text-text-error-primary">{state.errors.text}</span>}
        </label>
      ) : (
        <>
          <Input
            name="link"
            type="url"
            label={format === "voice" ? "Link to your voice note" : "Meeting link"}
            placeholder="https://"
            defaultValue={state.values?.link}
            hint={format === "voice" ? "Record it anywhere (your phone, Loom, Drive) and paste the link." : "Google Meet, Zoom or any link she can open."}
            isInvalid={Boolean(state.errors?.link)}
            errorMessage={state.errors?.link}
            {...touchInput}
          />
          {format === "call" && (
            <label className="flex flex-col gap-1.5 text-body-medium">
              When
              <input name="when" type="datetime-local" defaultValue={state.values?.when} aria-invalid={state.errors?.when ? true : undefined} />
              {state.errors?.when && <span role="alert" className="text-body-regular font-normal text-text-error-primary">{state.errors.when}</span>}
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-body-medium">
            A note for her (optional)
            <textarea name="text" rows={2} defaultValue={state.values?.text} />
          </label>
        </>
      )}
      {state.errors?.form && <p role="alert" className="text-body-regular text-text-error-primary">{state.errors.form}</p>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" disabled={pending} leadingIcon={RiCheckLine} className="h-11 rounded-full border-purple bg-purple px-5 text-dark-green shadow-none hover:bg-purple/80">
          {pending ? "Minting her skill coin…" : "Send and mark done"}
        </Button>
        <span className="text-body-regular text-text-secondary">Marking done mints {learner}&apos;s skill coin.</span>
      </div>
    </Form>
  );
}

/** Withdraw: send USDC to a wallet she owns. Starts with the one she connected in the header, if any. */
export function WithdrawBox({ balance }: { balance: number }) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(balance > 0 ? balance.toFixed(2) : "");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<MentorResult>();

  function show() {
    setOpen((v) => !v);
    try {
      setAddress((current) => current || localStorage.getItem("juno-connected-wallet") || "");
    } catch {}
  }
  return (
    <div className="flex flex-col gap-3">
      <Button onClick={show} aria-expanded={open} leadingIcon={RiArrowDownLine} className="h-11 w-full justify-center rounded-full shadow-none">
        Withdraw
      </Button>
      {open && (
        <form
          className="on-dark flex flex-col gap-3 rounded-xl bg-dark-green p-3.5"
          onSubmit={(event) => {
            event.preventDefault();
            start(async () => setResult(await withdraw(address.trim(), Number(amount))));
          }}
        >
          <Input label="To this wallet" value={address} onChange={setAddress} placeholder="G…" autoComplete="off" hint="Connect your wallet in the header to fill this in." {...touchInput} />
          <Input label="Amount (USDC)" value={amount} onChange={setAmount} inputMode="decimal" {...touchInput} />
          <Button type="submit" disabled={pending} className="h-11 rounded-full shadow-none">{pending ? "Sending…" : "Send"}</Button>
          <div aria-live="polite" className="text-body-regular">
            {result?.ok && result.tx && (
              <a href={explorer.tx(result.tx)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-neon px-3.5 text-body-medium text-dark-green">
                Sent · View on Stellar <RiArrowRightUpLine className="size-4" aria-hidden />
              </a>
            )}
            {result && !result.ok && <span className="text-text-error-primary">{result.reason}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
