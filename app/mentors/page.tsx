// The public page for mentors, built from Mentors.dc.html. Dark like the landing page, but with its own
// look: a purple hero band, one big headline, an earnings panel, and a price list on mint.
// "Apply to mentor" goes to the application; "Log in" goes to the usual Log in.
import type { Metadata } from "next";
import Link from "next/link";
import { RiAddLine, RiChat1Line, RiMicLine, RiVideoChatLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { LandingMotion } from "@/components/landing-motion";
import { cx } from "@/utils/cx";

export const metadata: Metadata = {
  title: "Mentor on Juno · juno",
  description: "Review a woman's work when her study agent asks for help. Set your own price. Get paid on Stellar the second you say yes.",
};

const APPLY = "/mentors/apply";
const LOG_IN = "/login";

const steps = [
  { title: "Apply", text: "Your skills and one link to your work. We set up your wallet." },
  { title: "Name your price", text: "Pick the formats you offer and what each one costs." },
  { title: "Get approved", text: "The Juno team reviews you, usually within two days." },
  { title: "Accept, help, get paid", text: "Paid when you accept. Mark it done and her skill coin is minted." },
];

const menu = [
  { Icon: RiChat1Line, tint: "bg-radiant", title: "Written feedback", text: "Clear notes on her work, delivered within 48 hours." },
  { Icon: RiMicLine, tint: "bg-neon", title: "Voice note", text: "Talk her through the why in a few minutes." },
  { Icon: RiVideoChatLine, tint: "bg-purple", title: "15-minute video call", text: "Work through it together, live." },
];

const promises = [
  { big: "24 h", tone: "text-radiant", title: "to accept or decline", text: "No answer? Her agent asks someone else." },
  { big: "48 h", tone: "text-radiant", title: "to deliver", text: "Missed it? She gets her money back." },
  { big: "Teach", tone: "text-purple", title: "don't do it for her", text: "Point the way. The skill coin should be hers." },
  { big: "Respect", tone: "text-purple", title: "always", text: "Keep it on Juno. No selling. Reports go to the team." },
];

const questions = [
  {
    q: "Do I need a crypto wallet?",
    a: "No. Juno creates one for you when you apply. You can connect your own wallet later to withdraw. During the beta, Juno runs on Stellar's test network, so no real money moves.",
  },
  {
    q: "Who can apply?",
    a: "Anyone with real experience in one of our courses: AI, prompting, Python, data or Stellar. Juno is built for women learners; mentors can be anyone who keeps the promise above.",
  },
  { q: "How much can I earn?", a: "You set your own price within the range for each format, and keep all of it during the beta." },
  { q: "What if I can't take a request?", a: "Decline it. No money moves, and her agent finds another mentor. You can also pause new requests from your dashboard." },
];

// A picture of payments arriving, not live data.
const payments = [
  { initial: "A", tint: "bg-radiant", text: "written feedback on “Agents that pay”", name: "Ada", chip: "+0.50 paid" },
  { initial: "T", tint: "bg-neon", text: "15-minute call on Python loops", name: "Tobi", chip: "+5.00 paid" },
  { initial: "Z", tint: "bg-purple", text: "voice note on few-shot prompts", name: "Zainab", chip: "New request · 1.00", pending: true },
];

const pill = "rounded-full shadow-none";
const onPurple = "border-dark-green bg-dark-green text-mint hover:bg-green";
const link = "flex min-h-11 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";
const h2 = "text-[clamp(1.875rem,4vw,3rem)] leading-[1.2] font-medium tracking-[-0.04em]";

export default function Mentors() {
  return (
    <>
      <LandingMotion />
      <div className="bg-purple text-dark-green">
        <header className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" aria-label="Juno home" className={cx(link, "gap-2")}>
            <CoinFan theme="ink" className="h-8 w-11.5" />
            <span className="text-wordmark">juno</span>
          </Link>
          <nav aria-label="Mentor" className="flex flex-wrap items-center gap-3 text-copy-sm">
            <Link href={LOG_IN} className={cx(link, "px-4 font-medium")}>Log in</Link>
            <ButtonLink href={APPLY} className={cx(pill, onPurple, "h-11 px-5 text-copy-sm font-medium")}>Apply to mentor</ButtonLink>
          </nav>
        </header>

        <section className="mx-auto flex max-w-300 flex-col gap-12 px-6 pt-12">
          <div className="flex flex-wrap items-end gap-x-16 gap-y-8">
            <h1 className="min-w-0 grow basis-140 text-[clamp(2.75rem,7.5vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.055em]">
              You know the answer. She&apos;s stuck on the question.
            </h1>
            <div className="flex min-w-0 grow basis-75 flex-col gap-5 pb-2">
              <p className="text-lead-sm text-mint">
                Review a woman&apos;s work when her study agent asks for help. Set your own price. Get paid on Stellar the second you say yes.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href={APPLY} className={cx(pill, onPurple, "h-13 px-6.5 text-cta")}>Apply to mentor</ButtonLink>
                <a href="#how" className={cx(link, "px-4 text-cta")}>How it works ↓</a>
              </div>
            </div>
          </div>

          <div
            role="img"
            aria-label="Payments arriving in a mentor's wallet"
            className="on-dark flex flex-wrap items-stretch gap-6 rounded-t-[28px] bg-dark-green p-7 pb-9 text-mint"
          >
            <div className="flex min-w-0 grow basis-65 flex-col justify-between gap-4">
              <span className="text-body-regular text-text-tertiary">Your mentor wallet · this week</span>
              <span className="text-[clamp(3rem,6vw,4.5rem)] leading-none font-medium tracking-[-0.05em] text-radiant">
                +8.00 <span className="text-lead tracking-normal">USDC</span>
              </span>
              <span className="text-body-regular text-text-secondary">6 reviews · 6 skill coins unlocked</span>
            </div>
            <ul className="m-0 flex min-w-0 grow-2 basis-120 list-none flex-col gap-2.5 p-0">
              {payments.map((p) => (
                <li key={p.name} className={cx("flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-2xl bg-green px-4 py-3.5", p.pending && "opacity-75")}>
                  <span className={cx("flex size-9 shrink-0 items-center justify-center rounded-full font-medium text-dark-green", p.tint)}>{p.initial}</span>
                  <span className="min-w-45 flex-1 text-copy-sm">
                    <b className="font-medium">{p.name}</b> · {p.text}
                  </span>
                  {p.pending ? (
                    <span className="rounded-full border border-text-tertiary px-3 py-1 text-body-2-medium">{p.chip}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neon px-3 py-1.25 text-body-2-medium text-dark-green">
                      <span className="size-1.75 rounded-full bg-dark-green" aria-hidden />
                      {p.chip}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <main>
        <section id="how" className="mx-auto flex max-w-300 scroll-mt-6 flex-col gap-12 px-6 py-24">
          <h2 data-reveal className={cx(h2, "max-w-190")}>From application to first payout, in four moves.</h2>
          <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6 gap-y-8 p-0">
            {steps.map((step, i) => {
              const last = i === steps.length - 1;
              return (
                <li key={step.title} data-reveal className={cx("flex flex-col gap-3.5 border-t-2 pt-5", last ? "border-radiant" : "border-purple")}>
                  <span className={cx("text-[3.5rem] leading-none font-medium tracking-[-0.05em]", last ? "text-radiant" : "text-purple")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-step">{step.title}</h3>
                  <p className="text-copy-sm text-text-secondary">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="bg-mint text-dark-green">
          <div className="mx-auto flex max-w-300 flex-wrap gap-x-16 gap-y-10 px-6 py-24">
            <div className="flex min-w-0 grow basis-80 flex-col gap-4">
              <span className="text-body-medium text-green">The menu</span>
              <h2 className={h2}>Three ways to help. Your prices.</h2>
              <p className="text-lead-sm text-ink-muted">Offer one format or all three. Juno sets a range for each so learners&apos; budgets stay safe.</p>
            </div>
            <ul className="m-0 flex min-w-0 grow-2 basis-130 list-none flex-col border-t-2 border-dark-green p-0">
              {menu.map(({ Icon, tint, title, text }) => (
                <li key={title} data-reveal className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-field-border py-7">
                  <span className={cx("flex size-14 shrink-0 items-center justify-center rounded-full", tint)}>
                    <Icon className="size-6.5" aria-hidden />
                  </span>
                  <div className="flex min-w-0 grow basis-55 flex-col gap-1">
                    <span className="text-[1.5rem] leading-tight font-medium tracking-[-0.03em]">{title}</span>
                    <span className="text-copy-sm text-ink-muted">{text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto flex max-w-300 flex-col gap-9 px-6 py-24">
          <h2 data-reveal className={cx(h2, "max-w-190")}>Why mentor on Juno</h2>
          <div className="flex flex-wrap gap-4">
            <div data-reveal className="flex min-h-90 min-w-0 grow basis-80 flex-col justify-between gap-8 rounded-3xl bg-radiant p-8 text-dark-green">
              <span className="text-copy-sm font-medium">Paid the moment you accept</span>
              <div className="flex flex-col gap-3">
                <span className="text-[clamp(4rem,8vw,7rem)] leading-[0.9] font-medium tracking-[-0.06em]">&lt;5 sec</span>
                <span className="text-copy">Her agent pays you with x402 on Stellar. No invoices. No waiting a month.</span>
              </div>
            </div>
            <div className="flex min-w-0 grow-2 basis-130 flex-wrap gap-4">
              <div data-reveal className="flex min-w-0 grow basis-60 flex-col gap-2.5 rounded-3xl bg-green p-7">
                <span className="text-[1.375rem] leading-tight font-medium tracking-[-0.02em]">On your schedule</span>
                <span className="text-copy-sm text-text-secondary">Accept what fits, decline what doesn&apos;t, pause requests any time.</span>
              </div>
              <div data-reveal className="flex min-w-0 grow basis-60 flex-col gap-2.5 rounded-3xl bg-green p-7">
                <span className="text-[1.375rem] leading-tight font-medium tracking-[-0.02em]">0% Juno fee</span>
                <span className="text-copy-sm text-text-secondary">During the beta you keep every coin you&apos;re paid.</span>
              </div>
              <div data-reveal className="flex basis-full flex-wrap items-center gap-x-8 gap-y-5 rounded-3xl bg-mint p-7 text-dark-green">
                <CoinFan theme="light" surface="stroke-mint" className="h-20.75 w-30 shrink-0" />
                <div className="flex min-w-0 grow basis-60 flex-col gap-2">
                  <span className="text-[1.375rem] leading-tight font-medium tracking-[-0.02em]">A record of every woman you helped</span>
                  <span className="text-copy-sm text-ink-muted">
                    Each review you mark done mints her skill coin on Stellar, with your name on it. Share it on Stallion and LinkedIn.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-green">
          <div className="mx-auto flex max-w-300 flex-col gap-9 px-6 py-24">
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
              <h2 data-reveal className={h2}>The mentor promise</h2>
              <span className="max-w-95 text-copy text-text-secondary">Anyone can apply. Everyone agrees to these four.</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-px overflow-hidden rounded-3xl border border-separator-border bg-separator-border">
              {promises.map((p) => (
                <div key={p.big} className="flex flex-col gap-2.5 bg-green p-7">
                  <span className={cx("text-[2.5rem] leading-tight font-medium tracking-[-0.04em]", p.tone)}>{p.big}</span>
                  <span className="text-lead-sm font-medium">{p.title}</span>
                  <span className="text-body-regular text-text-secondary">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-300 flex-wrap gap-x-16 gap-y-8 px-6 py-24">
          <h2 data-reveal className="min-w-0 grow basis-75 text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.2] font-medium tracking-[-0.04em]">
            Questions mentors ask
          </h2>
          <div className="flex min-w-0 grow-2 basis-130 flex-col border-t border-separator-border">
            {questions.map(({ q, a }) => (
              <details key={q} className="group border-b border-separator-border">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-3 text-title-3-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
                  {q}
                  <RiAddLine className="size-5 shrink-0 text-text-accent transition-transform group-open:rotate-45" aria-hidden />
                </summary>
                <p className="pb-5 text-copy text-text-secondary">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="start" className="bg-purple text-dark-green">
          <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-8 px-6 py-22">
            <h2 className="min-w-0 grow basis-130 text-[clamp(2.25rem,5.5vw,4.5rem)] leading-none font-medium tracking-[-0.05em]">Help her past the hard part.</h2>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={APPLY} className={cx(pill, onPurple, "h-14 px-7.5 text-cta")}>Apply to mentor</ButtonLink>
              <ButtonLink href={LOG_IN} variant="secondary" className={cx(pill, "h-14 border-dark-green bg-transparent px-6.5 text-cta text-dark-green hover:bg-purple hover:brightness-95")}>
                Log in
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-footer">
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-4 px-6 py-8 text-body-regular text-text-tertiary">
          <Link href="/" aria-label="Juno home" className={cx(link, "gap-2")}>
            <CoinFan surface="stroke-footer" className="h-6 w-8.5" />
            <span className="text-wordmark-sm text-text-accent">juno</span>
          </Link>
          <span>© 2026 Juno · Made for EmpowerHer: Building the Agent Economy</span>
          <Link href="/" className={cx(link, "text-text-primary hover:text-text-accent")}>Back to home</Link>
        </div>
      </footer>
    </>
  );
}
