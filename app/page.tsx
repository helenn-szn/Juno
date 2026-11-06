// The landing page, built from Landing.dc.html. Keep its copy as written.
import type { Metadata } from "next";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { cx } from "@/utils/cx";

export const metadata: Metadata = {
  title: "juno · Where women mint their skills.",
  description:
    "A sponsored learning wallet with an AI study agent. Free lessons first. When she's stuck, the agent pays a mentor in seconds. Every skill she earns is proven on-chain.",
};

const APP = "/app";

const problem = [
  {
    figure: "<13%",
    text: "of learners finish most online courses. They stall when they're stuck and nobody answers.",
    source: "Onah et al., 2014",
    href: "https://wrap.warwick.ac.uk/65543",
  },
  {
    figure: "24%",
    text: "of a woman's monthly income buys an entry-level phone in low and middle-income countries, twice the share for men.",
    source: "GSMA, 2025",
    href: "https://www.gsma.com/newsroom/press-release/progress-closing-the-mobile-internet-gender-gap-stalls-in-lmics-gsma-mobile-gender-gap-report-2025",
  },
  {
    figure: "29%",
    text: "is the mobile internet gender gap in Sub-Saharan Africa. Monthly subscriptions shut women out.",
    source: "GSMA, 2025",
    href: "https://www.gsma.com/newsroom/press-release/progress-closing-the-mobile-internet-gender-gap-stalls-in-lmics-gsma-mobile-gender-gap-report-2025",
  },
];

const steps = [
  {
    dot: "bg-radiant",
    title: "A sponsor fills her wallet",
    text: "An NGO, employer or family member tops up her learning wallet with USDC. It can only be spent on learning.",
  },
  {
    dot: "bg-radiant",
    title: "Her agent tries free first",
    text: "Her AI study agent builds a plan from free videos and courses, and notices when she's stuck.",
  },
  {
    dot: "bg-neon",
    title: "It pays a mentor, with her OK",
    text: "A mentor review costs cents, not a subscription. The agent asks, pays via x402, and the mentor is paid in seconds.",
  },
  {
    dot: "bg-purple",
    title: "Her skill is minted",
    text: "Each milestone becomes a skill coin on Stellar. A finished track earns a verifiable certificate.",
  },
];

const audiences = [
  {
    id: "learners",
    surface: "bg-radiant",
    title: "Learners",
    text: "Real help when you're stuck, no subscription, and proof of skill employers can check.",
    action: "Start learning",
  },
  {
    id: "mentors",
    surface: "bg-purple",
    title: "Mentors",
    text: "Share what you know and get paid per review, instantly, with a record of every woman you helped.",
    action: "Become a mentor",
  },
  {
    id: "sponsor",
    surface: "bg-mint",
    title: "Sponsors",
    text: "Fund a woman's learning and see exactly where every coin went and what she achieved.",
    action: "Sponsor a woman",
  },
];

const outcomes = [
  { dot: "bg-purple", title: "Verified certificate", text: "PDF with a QR code to her Stellar record" },
  { dot: "bg-radiant", title: "Resume, ready to send", text: "Filled from her skills using Juno templates" },
  { dot: "bg-neon", title: "Find work on Stallion", text: "Matching bounties, paid out on Stellar" },
];

const facts = [
  { figure: "Under 5 sec", text: "for a mentor to be paid on Stellar" },
  { figure: "Pay per help", text: "x402 payments, no subscriptions or cards" },
  { figure: "Public proof", text: "every payment and skill on the ledger" },
];

const pill = "rounded-full shadow-none";
const large = cx(pill, "h-13 px-5.5 text-cta");
const outline = "border-mint bg-transparent text-mint hover:border-mint hover:bg-green";
const eyebrow = "text-body-regular text-text-accent";
const grid = (min: string) => cx("grid gap-4", min);

export default function Landing() {
  return (
    <>
      <header className="mx-auto flex max-w-312 flex-wrap items-center justify-between gap-4 px-6 py-5">
        <a href="#top" className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
          <CoinFan className="h-8 w-11.5" />
          <span className="text-wordmark text-text-accent">juno</span>
        </a>
        <nav className="flex flex-wrap items-center gap-6 text-copy-sm">
          <a href="#how" className="hover:text-text-accent">How it works</a>
          <a href="#who" className="hover:text-text-accent">Who it&apos;s for</a>
          <a href="#work" className="hover:text-text-accent">Skills to work</a>
          <ButtonLink href={APP} className={cx(pill, "h-11 px-4.5 text-copy-sm font-medium")}>
            Get started
          </ButtonLink>
        </nav>
      </header>

      <main>
        <section id="top" className="mx-auto flex max-w-312 flex-wrap items-center gap-12 px-6 pt-14 pb-20">
          <div className="flex min-w-0 grow basis-110 flex-col gap-6">
            <span className="self-start rounded-full bg-purple px-3.5 py-1.5 text-body-medium text-dark-green">
              Built with x402 on Stellar
            </span>
            <h1 className="text-hero">
              Where women <span className="text-text-accent">mint</span> their skills.
            </h1>
            <p className="max-w-135 text-lead text-text-secondary">
              A sponsored learning wallet with an AI study agent. Free lessons first. When she&apos;s stuck, the agent
              pays a mentor in seconds. Every skill she earns is proven on-chain.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={APP} className={large}>Start learning</ButtonLink>
              <ButtonLink href={APP} variant="secondary" className={cx(large, outline)}>Sponsor a woman</ButtonLink>
            </div>
          </div>

          <figure className="flex min-w-0 grow basis-90 flex-col items-center gap-4">
            <CoinFan label="Juno coin fan" className="w-full max-w-115" />
            <div className="flex w-full max-w-95 flex-col gap-3 rounded-[20px] bg-green p-4.5">
              <p className="text-copy-sm">A mentor can review your logo today. It costs 0.50 USDC from your wallet. Book it?</p>
              <div className="flex gap-2">
                <span className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-radiant text-body-medium text-dark-green">
                  Book review
                </span>
                <span className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-mint text-body-medium">
                  Not now
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-neon px-4 py-2 text-body-medium text-dark-green">
              <span className="size-3 rounded-full bg-dark-green" />
              Done! Mentor paid.
            </span>
          </figure>
        </section>

        <section className="bg-mint text-dark-green">
          <div className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-18">
            <h2 className="max-w-190 text-section">Free lessons are everywhere. Real help isn&apos;t.</h2>
            <div className={grid("grid-cols-[repeat(auto-fit,minmax(240px,1fr))]")}>
              {problem.map((p) => (
                <div key={p.figure} className="flex flex-col gap-2 rounded-2xl bg-white p-6">
                  <span className="text-stat text-green">{p.figure}</span>
                  <span className="text-copy">{p.text}</span>
                  <a href={p.href} className="text-body-2-regular text-green underline">{p.source}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-22">
          <div className="flex max-w-180 flex-col gap-3">
            <span className={eyebrow}>How it works</span>
            <h2 className="text-section">Money moves only when real help is given.</h2>
          </div>
          <ol className={grid("grid-cols-[repeat(auto-fit,minmax(240px,1fr))]")}>
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-3 rounded-2xl bg-green p-6">
                <span className={cx("flex size-10 items-center justify-center rounded-full text-headline-medium text-dark-green", s.dot)}>
                  {i + 1}
                </span>
                <h3 className="text-step">{s.title}</h3>
                <p className="text-copy-sm text-text-secondary">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="who" className="bg-green">
          <div className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-22">
            <div className="flex max-w-180 flex-col gap-3">
              <span className={eyebrow}>Who it&apos;s for</span>
              <h2 className="text-section">Women win on both sides of every payment.</h2>
            </div>
            <div className={grid("grid-cols-[repeat(auto-fit,minmax(260px,1fr))]")}>
              {audiences.map((a) => (
                <div key={a.id} id={a.id} className={cx("flex flex-col gap-3 rounded-2xl p-7 text-dark-green", a.surface)}>
                  <h3 className="text-role">{a.title}</h3>
                  <p className="text-copy">{a.text}</p>
                  <a href={APP} className="mt-auto self-start text-headline-medium underline">{a.action}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="mx-auto flex max-w-312 flex-wrap items-center gap-12 px-6 py-22">
          <div className="flex min-w-0 grow basis-105 flex-col gap-4">
            <span className={eyebrow}>From skills to work</span>
            <h2 className="text-section">Learn it. Prove it. Get paid for it.</h2>
            <p className="text-lead-sm text-text-secondary">
              Every finished track earns a certificate anyone can verify on Stellar. Juno turns her proof into a resume
              from our templates, then sends her to matching work on Stallion.
            </p>
          </div>
          <ul className="flex min-w-0 grow basis-95 flex-col gap-3">
            {outcomes.map((o) => (
              <li key={o.title} className="flex items-center gap-3.5 rounded-2xl bg-green px-5 py-4.5">
                <span className={cx("size-10 shrink-0 rounded-full", o.dot)} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-cta">{o.title}</span>
                  <span className="text-body-regular text-text-secondary">{o.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-separator-border">
          <dl className="mx-auto grid max-w-312 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-6 py-12">
            {facts.map((f) => (
              <div key={f.figure} className="flex flex-col gap-1.5">
                <dt className="text-figure text-text-accent">{f.figure}</dt>
                <dd className="text-copy-sm text-text-secondary">{f.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="start" className="mx-auto flex max-w-312 flex-col items-center gap-6 px-6 py-24 text-center">
          <CoinFan label="Juno coin fan" className="h-27.75 w-40" />
          <h2 className="max-w-205 text-closing">Sponsor her first skill.</h2>
          <p className="max-w-140 text-lead-sm text-text-secondary">
            Juno is in beta on Stellar testnet, built for EmpowerHer 2026. Try the demo and watch a skill get minted.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={APP} className={large}>Launch the demo</ButtonLink>
            <ButtonLink href={APP} id="mentor" variant="secondary" className={cx(large, outline)}>
              Become a mentor
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-312 flex-wrap justify-between gap-4 border-t border-separator-border px-6 pt-8 pb-12 text-body-regular text-text-tertiary">
        <span className="text-wordmark-sm text-text-accent">juno</span>
        <span>Learn. Prove. Rise. · Built with x402 on Stellar</span>
        <a href="https://stallion.so" className="underline hover:text-text-primary">Find work on Stallion</a>
      </footer>
    </>
  );
}
