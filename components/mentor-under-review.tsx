// What a mentor sees after she submits: thanks, what happens next, and her mentor ID.
import { RiCheckLine, RiTimeLine } from "@remixicon/react";
import { logOut } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import type { User } from "@/lib/users";

const next = [
  { done: true, text: "Your application is in." },
  { done: false, text: "The Juno team checks your link and skills, usually within two days." },
  { done: false, text: "Approved: your dashboard opens and requests start coming in. We'll tell you with a notification and your status here." },
];

export function MentorUnderReview({ user }: { user: User }) {
  const first = user.name.split(" ")[0];
  return (
    <>
      <header className="flex items-center gap-3 border-b border-line px-6 py-4">
        <span className="me-auto flex min-h-11 items-center gap-2">
          <CoinFan theme="light" className="h-6 w-9" />
          <span className="text-wordmark-sm text-text-accent">juno</span>
          <span className="rounded-full bg-purple px-2.5 py-1 text-body-2-medium text-dark-green">Mentors</span>
        </span>
        <form action={logOut}>
          <Button type="submit" variant="secondary" className="h-11 rounded-full px-4 shadow-none">Log out</Button>
        </form>
      </header>
      <div className="mx-auto flex w-full max-w-130 flex-col gap-6 px-6 py-12">
        <span className="flex size-12 items-center justify-center rounded-full bg-purple text-dark-green"><RiTimeLine className="size-6" aria-hidden /></span>
        <div className="flex flex-col gap-2">
          <p className="text-body-medium text-text-secondary">Under review</p>
          <h1 className="text-title-1-medium tracking-[-0.03em]">Thanks, {first}. We&apos;re reviewing your application.</h1>
        </div>
        <div className="on-dark flex flex-col gap-1 rounded-2xl bg-green px-5 py-4 text-mint">
          <span className="text-body-regular text-text-tertiary">Your Juno mentor ID</span>
          <span className="font-mono text-title-1-medium tracking-[0.06em]">{user.mentor!.mentorId}</span>
        </div>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {next.map((step) => (
            <li key={step.text} className="flex items-start gap-3 text-copy-sm">
              <span className={step.done ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-neon text-dark-green" : "mt-0.5 size-5 shrink-0 rounded-full border border-field-border"}>
                {step.done && <RiCheckLine className="size-3.5" aria-hidden />}
              </span>
              {step.text}
            </li>
          ))}
        </ol>
        <p className="text-copy-sm text-text-secondary">Not approved yet? We&apos;ll tell you what to add, and you can apply again.</p>
      </div>
    </>
  );
}
