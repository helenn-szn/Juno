"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightUpLine } from "@remixicon/react";
import { fundSeats, inviteLearner, topUp, type SponsorFormState, type TopUpResult } from "@/app/sponsor/actions";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CopyLink } from "@/components/copy-link";
import { touchInput } from "@/components/touch-input";
import { courses } from "@/lib/courses";
import { explorer } from "@/lib/constants";

const field = "flex flex-col gap-1.5 text-body-medium";
const select =
  "h-11 rounded-full border border-line bg-white px-3.5 text-body-regular text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

function CourseSelect() {
  return (
    <label className={field}>
      Course
      <select name="course" required className={select} defaultValue="build-ai-agents">
        {courses.map((course) => (
          <option key={course.slug} value={course.slug}>
            {course.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function Budget({ label = "Budget per learner (USDC)" }: { label?: string }) {
  return <Input name="budget" type="number" label={label} defaultValue="20" isRequired {...touchInput} />;
}

/** Invite one woman: pick her course and budget, and get a link to share. */
export function InviteForm() {
  const [state, action, pending] = useActionState<SponsorFormState, FormData>(inviteLearner, {});
  if (state.done && state.token) {
    const link = `${window.location.origin}/signup?invite=${state.token}`;
    return (
      <div className="flex max-w-120 flex-col gap-4 p-6 lg:p-7" aria-live="polite">
        <h2 className="text-title-2-medium tracking-[-0.02em]">Your invite is ready</h2>
        <p className="text-copy text-text-secondary">Share this link with her. When she creates her account through it, her budget is sent to her wallet.</p>
        <p className="rounded-xl bg-mint px-4 py-3 text-copy-sm break-all">{link}</p>
        <div className="flex flex-wrap gap-2.5">
          <CopyLink url={link}>Copy link</CopyLink>
          <a href="/sponsor#learners" className="flex min-h-11 items-center px-3 text-body-medium text-green underline">Back to my learners</a>
        </div>
      </div>
    );
  }
  return (
    <form action={action} className="flex max-w-120 flex-col gap-5 p-6 lg:p-7">
      <Input name="label" label="Who is she? (a name, only for you)" placeholder="e.g. Ada" autoComplete="off" {...touchInput} />
      <CourseSelect />
      <Budget />
      <p className="text-body-regular text-text-secondary">This amount moves from your wallet to hers when she joins. What she doesn&apos;t spend stays with her.</p>
      {state.error && <p role="alert" className="text-body-regular text-text-error-primary">{state.error}</p>}
      <div className="flex flex-wrap gap-2.5">
        <Button type="submit" disabled={pending} className="h-12 rounded-full px-6 shadow-none">{pending ? "Creating…" : "Create invite link"}</Button>
        <a href="/sponsor/fund" className="flex min-h-12 items-center px-3 text-body-medium text-green underline">Top up first</a>
      </div>
    </form>
  );
}

/** Open seats on a course, for any learner who enrols. */
export function SeatsForm() {
  const [state, action, pending] = useActionState<SponsorFormState, FormData>(fundSeats, {});
  return (
    <form action={action} className="flex max-w-120 flex-col gap-5 p-6 lg:p-7">
      <CourseSelect />
      <Input name="seats" type="number" label="Seats" defaultValue="5" isRequired {...touchInput} />
      <Budget label="Budget per seat (USDC)" />
      <p className="text-body-regular text-text-secondary">Any woman who starts this course takes a seat, first come, first served. Her budget moves to her wallet when she does.</p>
      {state.error && <p role="alert" className="text-body-regular text-text-error-primary">{state.error}</p>}
      <div className="flex flex-wrap gap-2.5">
        <Button type="submit" disabled={pending} className="h-12 rounded-full px-6 shadow-none">{pending ? "Saving…" : "Open seats"}</Button>
        <a href="/sponsor/fund" className="flex min-h-12 items-center px-3 text-body-medium text-green underline">Top up first</a>
      </div>
    </form>
  );
}

const problems = {
  "no-wallet": "Your wallet is still being set up. Try again in a moment.",
  "no-liquidity": "No one is selling test USDC right now. Try the Circle faucet below.",
  failed: "That didn't go through. Try again?",
};

/** Adds testnet USDC to the sponsor's wallet. It can take a few seconds. */
export function TopUp() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<TopUpResult>();
  const [which, setWhich] = useState<number>();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        {[20, 50, 100].map((amount) => (
          <Button
            key={amount}
            variant="secondary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setWhich(amount);
                setResult(await topUp(amount));
                router.refresh();
              })
            }
            className="h-12 rounded-full px-6 shadow-none"
          >
            {pending && which === amount ? "Adding…" : `Add ${amount} USDC`}
          </Button>
        ))}
      </div>
      <div aria-live="polite">
        {result?.ok && (
          <a href={explorer.tx(result.tx)} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 self-start rounded-full bg-neon px-4 text-body-medium text-dark-green">
            Done! Your wallet is topped up
            <RiArrowRightUpLine className="size-5" aria-hidden />
          </a>
        )}
        {result && !result.ok && <p className="text-body-regular text-text-error-primary">{problems[result.reason]}</p>}
      </div>
    </div>
  );
}
