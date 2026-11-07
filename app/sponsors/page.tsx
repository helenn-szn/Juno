// The public page for sponsors, built from Sponsors.dc.html. Same dark look as the landing page.
// "Start sponsoring" goes to sponsor sign-up; "Log in" goes to the usual Log in.
import type { Metadata } from "next";
import Link from "next/link";
import { RiAddLine, RiHeartLine, RiLockLine, RiSearchLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { LandingMotion } from "@/components/landing-motion";
import { cx } from "@/utils/cx";

export const metadata: Metadata = {
  title: "Sponsor a woman · juno",
  description:
    "Top up once. Her AI study agent spends it only on learning, and you see every payment and every skill she earns, recorded on Stellar.",
};

const SIGN_UP = "/signup?as=sponsor";
const LOG_IN = "/login";

const steps = [
  { dot: "bg-green text-radiant", title: "Create your account", text: "Sign up as a person or an organisation. Your wallet is set up for you." },
  { dot: "bg-green text-radiant", title: "Fund your wallet", text: "Add USDC, a digital dollar. Top up any time." },
  { dot: "bg-green text-radiant", title: "Choose who to sponsor", text: "Invite a woman you know, or fund open seats on a course." },
  { dot: "bg-purple text-dark-green", title: "Set her budget", text: "Pick a total per learner. It moves into her learning wallet when she joins." },
];

const protections = [
  { Icon: RiLockLine, tint: "bg-radiant", title: "Only spent on learning", text: "Her wallet pays for mentor reviews and tests, and nothing else." },
  { Icon: RiSearchLine, tint: "bg-purple", title: "Proof on Stellar", text: "Every payment and certificate links to the public ledger." },
  { Icon: RiHeartLine, tint: "bg-neon", title: "Unspent funds stay with her", text: "Whatever she doesn't use carries over to her next course." },
];

const questions = [
  {
    q: "Do I need to know about crypto?",
    a: "No. You fund your wallet with USDC, a digital dollar, and Juno handles the rest. During the beta, Juno runs on Stellar's test network, so no real money moves.",
  },
  {
    q: "How do I know my money was used well?",
    a: "Your dashboard shows each payment, what it bought, and the skills and certificates she earned, each with a Stellar link you can check.",
  },
  { q: "Can I sponsor more than one woman?", a: "Yes. Invite as many learners as you like, or fund several seats on a course." },
  { q: "What happens to money she doesn't spend?", a: "It stays in her learning wallet for her next course, so it keeps working for her." },
];

// The example dashboard in the hero: a picture of what a sponsor sees, not live data.
const learners = [
  { initial: "A", tint: "bg-purple", label: "Ada · Build AI Agents", note: "43%", percent: 43, bar: "bg-green" },
  { initial: "T", tint: "bg-radiant", label: "Tobi · Python", note: "25%", percent: 25, bar: "bg-green" },
  { initial: "K", tint: "bg-neon", label: "Kemi · Prompt Engineering", note: "Certified", percent: 100, bar: "bg-purple" },
];

const pill = "rounded-full shadow-none";
const large = cx(pill, "h-13 px-5.5 text-cta");
const outline = "border-mint bg-transparent text-mint hover:border-mint hover:bg-green";
const eyebrow = "text-body-regular text-text-accent";
const link = "flex min-h-11 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

export default function Sponsors() {
  return (
    <>
      <LandingMotion />
      <header className="mx-auto flex max-w-312 flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/" aria-label="Juno home" className={cx(link, "gap-2")}>
          <CoinFan className="h-8 w-11.5" />
          <span className="text-wordmark text-text-accent">juno</span>
        </Link>
        <nav aria-label="Sponsor" className="flex flex-wrap items-center gap-3 text-copy-sm">
          <Link href={LOG_IN} className={cx(link, "px-4 hover:text-text-accent")}>Log in</Link>
          <ButtonLink href={SIGN_UP} className={cx(pill, "h-11 px-5 text-copy-sm font-medium")}>
            Start sponsoring
          </ButtonLink>
        </nav>
      </header>

      <main>
        <section className="mx-auto flex max-w-312 flex-wrap items-center gap-12 px-6 pt-14 pb-22">
          <div className="flex min-w-0 grow basis-110 flex-col gap-6">
            <span className="self-start rounded-full bg-purple px-3.5 py-1.5 text-body-medium text-dark-green">For sponsors</span>
            <h1 className="text-[clamp(2.5rem,6vw,4.75rem)] leading-none font-medium tracking-[-0.05em]">
              Fund her skills. See every <span className="text-text-accent">coin</span> at work.
            </h1>
            <p className="max-w-135 text-lead text-text-secondary">
              Top up once. Her AI study agent spends it only on learning, and you see every payment and every skill she earns,
              recorded on Stellar.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={SIGN_UP} className={large}>Start sponsoring</ButtonLink>
              <ButtonLink href="#how" variant="secondary" className={cx(large, outline)}>See how it works</ButtonLink>
            </div>
          </div>

          <div
            role="img"
            aria-label="Example sponsor dashboard"
            className="app-light flex min-w-0 grow basis-95 flex-col gap-4 rounded-[20px] bg-white p-5 text-text-primary"
          >
            <div className="on-dark flex items-center justify-between gap-3 rounded-[14px] bg-green px-4.5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-body-2-regular text-text-tertiary">Sponsor wallet</span>
                <span className="text-display-4-medium tracking-[-0.03em] text-radiant">
                  120.00 <span className="text-body-2-regular">USDC</span>
                </span>
              </div>
              <span className="inline-flex min-h-9 items-center rounded-full bg-radiant px-3.5 text-body-2-medium text-dark-green">Top up</span>
            </div>
            <div className="flex flex-col">
              {learners.map((learner) => (
                <div key={learner.initial} className="flex min-h-14 items-center gap-3 border-b border-line last:border-b-0">
                  <span className={cx("flex size-9 shrink-0 items-center justify-center rounded-full text-body-2-medium", learner.tint)}>{learner.initial}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex justify-between gap-2 text-body-regular">
                      <span className="truncate text-body-medium">{learner.label}</span>
                      <span className="text-text-secondary">{learner.note}</span>
                    </div>
                    <div className="h-1.25 rounded-full bg-line">
                      <div className={cx("h-1.25 rounded-full", learner.bar)} style={{ width: `${learner.percent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neon px-3 py-1.5 text-body-2-medium">
                <span className="size-2 rounded-full bg-dark-green" aria-hidden />
                Mentor review · 0.50 USDC
              </span>
              <span className="inline-flex items-center rounded-full bg-purple px-3 py-1.5 text-body-2-medium">Certificate issued</span>
            </div>
          </div>
        </section>

        <section id="how" className="bg-mint text-dark-green">
          <div className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-22">
            <div data-reveal className="flex max-w-180 flex-col gap-3">
              <span className="text-body-medium text-green">How sponsoring works</span>
              <h2 className="text-section">Four steps, about five minutes.</h2>
            </div>
            <ol className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              {steps.map((step, index) => (
                <li key={step.title} data-reveal className="flex flex-col gap-3 rounded-2xl bg-white p-6">
                  <span className={cx("flex size-10 items-center justify-center rounded-full text-headline-medium", step.dot)}>{index + 1}</span>
                  <h3 className="text-step">{step.title}</h3>
                  <p className="text-copy-sm text-ink-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-22">
          <div data-reveal className="flex max-w-180 flex-col gap-3">
            <span className={eyebrow}>Two ways to sponsor</span>
            <h2 className="text-section">Back one woman, or open the door for many.</h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
            <div data-reveal className="flex flex-col gap-4.5 rounded-[20px] bg-green p-7">
              <h3 className="text-role">Invite a learner</h3>
              <p className="text-copy text-text-secondary">For someone you know: a daughter, a sister, an employee, a woman in your community.</p>
              <div className="flex flex-wrap items-center gap-2.5 rounded-[14px] bg-dark-green p-3.5">
                <span className="min-w-40 flex-1 truncate text-copy-sm text-text-secondary">juno.app/join/your-invite</span>
                <span className="inline-flex min-h-10 items-center rounded-full bg-radiant px-4 text-body-2-medium text-dark-green">Copy link</span>
              </div>
              <span className="text-copy-sm text-text-tertiary">Best for families and friends</span>
            </div>
            <div data-reveal className="flex flex-col gap-4.5 rounded-[20px] bg-purple p-7 text-dark-green">
              <h3 className="text-role">Fund course seats</h3>
              <p className="text-copy">Open seats on a course. Any woman who enrols takes one, first come, first served.</p>
              <div className="flex flex-col gap-2.5 rounded-[14px] bg-mint p-3.5">
                <div className="flex justify-between text-copy-sm">
                  <span className="text-body-medium">Build AI Agents</span>
                  <span>seats filling</span>
                </div>
                <div className="flex gap-1.5" aria-hidden>
                  {[0, 1, 2, 3, 4].map((seat) => (
                    <span key={seat} className={cx("h-2.5 flex-1 rounded-full", seat < 3 ? "bg-green" : "bg-paper-line")} />
                  ))}
                </div>
              </div>
              <span className="text-copy-sm">Best for NGOs and companies</span>
            </div>
          </div>
        </section>

        <section className="bg-green">
          <div className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-22">
            <div data-reveal className="flex max-w-180 flex-col gap-3">
              <span className={eyebrow}>Your money, protected</span>
              <h2 className="text-section">Every coin goes to learning. You can check them all.</h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              {protections.map(({ Icon, tint, title, text }) => (
                <div key={title} data-reveal className="flex flex-col gap-2.5 rounded-2xl bg-dark-green p-6">
                  <span className={cx("flex size-10 items-center justify-center rounded-xl text-dark-green", tint)}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="text-title-3-medium">{title}</h3>
                  <p className="text-copy-sm text-text-secondary">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-200 flex-col gap-6 px-6 py-22">
          <h2 data-reveal className="text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium tracking-[-0.04em]">Questions sponsors ask</h2>
          <div className="flex flex-col border-t border-separator-border">
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

        <section id="start" className="border-t border-separator-border">
          <div className="mx-auto flex max-w-312 flex-col items-center gap-6 px-6 py-24 text-center">
            <CoinFan label="Juno coin fan" data-reveal className="h-27.75 w-40" />
            <h2 data-reveal className="max-w-205 text-closing">Sponsor her first skill.</h2>
            <div data-reveal className="flex flex-wrap justify-center gap-3">
              <ButtonLink href={SIGN_UP} className={large}>Start sponsoring</ButtonLink>
              <ButtonLink href={LOG_IN} variant="secondary" className={cx(large, outline)}>Log in</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-footer">
        <div className="mx-auto flex max-w-312 flex-wrap items-center justify-between gap-4 px-6 py-8 text-body-regular text-text-tertiary">
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
