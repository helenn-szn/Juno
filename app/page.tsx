// The landing page, built from Landing.dc.html. Keep its copy as written.
import type { Metadata } from "next";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { LandingHeader } from "@/components/landing-header";
import { CountUp } from "@/components/count-up";
import { LandingMotion } from "@/components/landing-motion";
import { cx } from "@/utils/cx";

export const metadata: Metadata = {
  title: "juno · Where women mint their skills.",
  description:
    "A sponsored learning wallet with an AI study agent. Free lessons first. When she's stuck, the agent pays a mentor in seconds. Every skill she earns is proven on-chain.",
};

const APP = "/app";
const SPONSORS = "/sponsors";
const MENTORS = "/mentors";

const problem = [
  {
    figure: { prefix: "<", value: 13, suffix: "%" },
    text: "of learners finish most online courses. They stall when they're stuck and nobody answers.",
    source: "Onah et al., 2014",
    href: "https://wrap.warwick.ac.uk/65543",
  },
  {
    figure: { prefix: "", value: 24, suffix: "%" },
    text: "of a woman's monthly income buys an entry-level phone in low and middle-income countries, twice the share for men.",
    source: "GSMA, 2025",
    href: "https://www.gsma.com/newsroom/press-release/progress-closing-the-mobile-internet-gender-gap-stalls-in-lmics-gsma-mobile-gender-gap-report-2025",
  },
  {
    figure: { prefix: "", value: 29, suffix: "%" },
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
    href: APP,
  },
  {
    id: "mentors",
    surface: "bg-purple",
    title: "Mentors",
    text: "Share what you know and get paid per review, instantly, with a record of every woman you helped.",
    action: "Become a mentor",
    href: MENTORS,
  },
  {
    id: "sponsor",
    surface: "bg-mint",
    title: "Sponsors",
    text: "Fund a woman's learning and see exactly where every coin went and what she achieved.",
    action: "Sponsor a woman",
    href: SPONSORS,
  },
];

const skills = ["AI agents", "Prompting", "x402"];
const jobs = ["Support bot for a shop", "Prompt library for a startup"];

const footerLinks = [
  {
    title: "Explore",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#who", label: "Who it's for" },
      { href: "#work", label: "Skills to work" },
      { href: SPONSORS, label: "Sponsor" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { href: "#start", label: "Start learning" },
      { href: MENTORS, label: "Become a mentor" },
      { href: SPONSORS, label: "Sponsor a woman" },
    ],
  },
  {
    title: "Built on",
    links: [
      { href: "https://stellar.org", label: "Stellar" },
      { href: "https://developers.stellar.org/docs/build/agentic-payments/x402", label: "x402" },
      { href: "https://stallion.so", label: "Stallion" },
    ],
  },
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
const card = "flex flex-col gap-4.5 rounded-[20px] p-6";
const grid = (min: string) => cx("grid gap-4", min);

export default function Landing() {
  return (
    <>
      <LandingMotion />
      <LandingHeader appHref={APP} />

      <main>
        <section id="top" className="mx-auto flex max-w-312 flex-wrap items-center gap-12 px-6 pt-14 pb-20">
          <div className="flex min-w-0 grow basis-110 flex-col gap-6">
            <span style={{ "--d": "0ms" } as React.CSSProperties} className="hero-in self-start rounded-full bg-purple px-3.5 py-1.5 text-body-medium text-dark-green">
              Built with x402 on Stellar
            </span>
            <h1 style={{ "--d": "100ms" } as React.CSSProperties} className="hero-in text-hero">
              Where women <span className="text-text-accent">mint</span> their skills.
            </h1>
            <p style={{ "--d": "220ms" } as React.CSSProperties} className="hero-in max-w-135 text-lead text-text-secondary">
              A sponsored learning wallet with an AI study agent. Free lessons first. When she&apos;s stuck, the agent
              pays a mentor in seconds. Every skill she earns is proven on-chain.
            </p>
            <div style={{ "--d": "340ms" } as React.CSSProperties} className="hero-in flex flex-wrap gap-3">
              <ButtonLink href={APP} className={large}>Start learning</ButtonLink>
              <ButtonLink href={SPONSORS} variant="secondary" className={cx(large, outline)}>Sponsor a woman</ButtonLink>
            </div>
          </div>

          <figure className="flex min-w-0 grow basis-90 flex-col items-center gap-4">
            <div className="fan-float w-full max-w-115">
              <CoinFan label="Juno coin fan" animate className="w-full" />
            </div>
            <div style={{ "--d": "800ms" } as React.CSSProperties} className="hero-in flex w-full max-w-95 flex-col gap-3 rounded-[20px] bg-green p-4.5">
              <p className="text-copy-sm">A mentor can review your agent today. It costs 0.50 USDC from your wallet. Book it?</p>
              <div className="flex gap-2">
                <span style={{ "--d": "1500ms" } as React.CSSProperties} className="press flex min-h-11 flex-1 items-center justify-center rounded-full bg-radiant text-body-medium text-dark-green">
                  Book review
                </span>
                <span className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-mint text-body-medium">
                  Not now
                </span>
              </div>
            </div>
            <span style={{ "--d": "1850ms" } as React.CSSProperties} className="pop-in inline-flex items-center gap-2 rounded-full bg-neon px-4 py-2 text-body-medium text-dark-green">
              <span className="size-3 rounded-full bg-dark-green" />
              Done! Mentor paid.
            </span>
          </figure>
        </section>

        <section className="bg-mint text-dark-green">
          <div className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-18">
            <h2 data-reveal className="max-w-190 text-section">Free lessons are everywhere. Real help isn&apos;t.</h2>
            <div className={grid("grid-cols-[repeat(auto-fit,minmax(240px,1fr))]")}>
              {problem.map((p) => (
                <div key={p.text} data-reveal className="lift flex flex-col gap-2 rounded-2xl bg-white p-6">
                  <CountUp className="text-stat text-green" {...p.figure} />
                  <span className="text-copy">{p.text}</span>
                  <a href={p.href} className="text-body-2-regular text-green underline">{p.source}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-22">
          <div data-reveal className="flex max-w-180 flex-col gap-3">
            <span className={eyebrow}>How it works</span>
            <h2 className="text-section">Money moves only when real help is given.</h2>
          </div>
          <ol className={grid("grid-cols-[repeat(auto-fit,minmax(240px,1fr))]")}>
            {steps.map((s, i) => (
              <li key={s.title} data-reveal className="lift flex flex-col gap-3 rounded-2xl bg-green p-6">
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
            <div data-reveal className="flex max-w-180 flex-col gap-3">
              <span className={eyebrow}>Who it&apos;s for</span>
              <h2 className="text-section">Women win on both sides of every payment.</h2>
            </div>
            <div className={grid("grid-cols-[repeat(auto-fit,minmax(260px,1fr))]")}>
              {audiences.map((a) => (
                <div key={a.id} id={a.id} data-reveal className={cx("lift flex flex-col gap-3 rounded-2xl p-7 text-dark-green", a.surface)}>
                  <h3 className="text-role">{a.title}</h3>
                  <p className="text-copy">{a.text}</p>
                  <a href={a.href} className="mt-auto self-start text-headline-medium underline">{a.action}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="mx-auto flex max-w-312 flex-col gap-9 px-6 py-22">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
            <div className="flex min-w-0 grow basis-105 flex-col gap-3">
              <span className={eyebrow}>From skills to work</span>
              <h2 className="text-section">Learn it. Prove it. Get paid for it.</h2>
            </div>
            <p className="min-w-0 grow basis-85 text-lead-sm text-text-secondary">
              Her proof doesn&apos;t sit in a drawer. Juno turns every finished course into a certificate, a resume and a
              path to paid work.
            </p>
          </div>
          <div className={grid("grid-cols-[repeat(auto-fit,minmax(270px,1fr))]")}>
            <div data-reveal className={cx(card, "lift bg-mint text-dark-green")}>
              <span className="text-body-2-medium text-green">01 · Certificate</span>
              <div className="flex items-center gap-4 rounded-[14px] border border-paper-line bg-white p-4.5">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body-2-regular text-ink-muted">Certificate of completion</span>
                  <span className="text-headline-medium">Build AI Agents</span>
                  <span className="text-body-2-regular text-ink-muted">Ada · reviewed by a Juno mentor</span>
                </div>
                <svg role="img" aria-label="QR code" width="64" height="64" viewBox="0 0 7 7" className="shrink-0">
                  <path d="M0 0h3v3H0zM4 0h3v3H4zM0 4h3v3H0z" className="fill-dark-green" />
                  <path d="M1 1h1v1H1zM5 1h1v1H5zM1 5h1v1H1z" className="fill-white" />
                  <path d="M4 4h1v1H4zM6 4h1v1H6zM5 5h1v1H5zM4 6h1v1H4zM6 6h1v1H6z" className="fill-dark-green" />
                </svg>
              </div>
              <span className="self-start rounded-full bg-purple px-3 py-1.5 text-body-2-medium">Verified on Stellar</span>
              <p className="text-copy-sm">Anyone can scan the code and check it&apos;s real.</p>
            </div>

            <div data-reveal className={cx(card, "lift bg-green")}>
              <span className="text-body-2-medium text-text-accent">02 · Resume</span>
              <div className="flex flex-col gap-3 rounded-[14px] bg-dark-green p-4.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-purple text-body-medium text-dark-green">A</span>
                  <div className="flex flex-col">
                    <span className="text-body-medium">Ada</span>
                    <span className="text-body-2-regular text-text-tertiary">AI agent builder</span>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <li key={skill} className="rounded-full border border-radiant px-2.5 py-1 text-body-2-regular text-text-accent">{skill}</li>
                  ))}
                </ul>
              </div>
              <span className="self-start rounded-full bg-radiant px-3 py-1.5 text-body-2-medium text-dark-green">Filled in for her</span>
              <p className="text-copy-sm text-text-secondary">Built from her skills and projects with Juno templates.</p>
            </div>

            <div data-reveal className={cx(card, "lift bg-purple text-dark-green")}>
              <span className="text-body-2-medium">03 · Work</span>
              <ul className="flex flex-col rounded-[14px] bg-mint px-4.5 py-2">
                {jobs.map((job) => (
                  <li key={job} className="flex min-h-12 items-center justify-between gap-3 border-paper-line not-last:border-b">
                    <span className="text-copy-sm">{job}</span>
                    <span className="text-body-2-regular text-ink-muted">USDC</span>
                  </li>
                ))}
              </ul>
              <a href="https://stallion.so" className="inline-flex min-h-12 items-center justify-center rounded-full bg-dark-green text-cta text-text-primary hover:text-text-accent">
                Find work on Stallion
              </a>
              <p className="text-copy-sm">Matching bounties, paid straight to her Stellar wallet.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-separator-border">
          <dl className="mx-auto grid max-w-312 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-6 py-12">
            {facts.map((f) => (
              <div key={f.figure} data-reveal className="flex flex-col gap-1.5">
                <dt className="text-figure text-text-accent">{f.figure}</dt>
                <dd className="text-copy-sm text-text-secondary">{f.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="start" className="mx-auto flex max-w-312 flex-col items-center gap-6 px-6 py-24 text-center">
          <CoinFan label="Juno coin fan" data-reveal className="h-27.75 w-40" />
          <h2 data-reveal className="max-w-205 text-closing">Sponsor her first skill.</h2>
          <p data-reveal className="max-w-140 text-lead-sm text-text-secondary">
            Juno is in beta on Stellar testnet, built for EmpowerHer 2026. Try the demo and watch a skill get minted.
          </p>
          <div data-reveal className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={APP} className={large}>Launch the demo</ButtonLink>
            <ButtonLink href={MENTORS} id="mentor" variant="secondary" className={cx(large, outline)}>
              Become a mentor
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-footer">
        <div className="mx-auto flex max-w-312 flex-col gap-10 px-6 pt-14 pb-8">
          <div className="flex flex-wrap gap-10">
            <div className="flex min-w-0 grow-2 basis-70 flex-col gap-3.5">
              <a href="#top" className="flex min-h-11 items-center gap-2 self-start rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
                <CoinFan surface="stroke-footer" className="h-8 w-11.5" />
                <span className="text-wordmark text-text-accent">juno</span>
              </a>
              <p className="max-w-80 text-copy text-text-secondary">Where women mint their skills.</p>
              <span className="self-start rounded-full bg-purple px-3 py-1.5 text-body-2-medium text-dark-green">
                Built with x402 on Stellar
              </span>
            </div>
            {footerLinks.map((group) => (
              <nav key={group.title} aria-label={group.title} className="flex min-w-0 grow basis-40 flex-col text-copy-sm">
                <span className="mb-2 text-body-2-regular text-text-tertiary">{group.title}</span>
                {group.links.map((link) => (
                  <a key={link.href} href={link.href} className="flex min-h-11 items-center hover:text-text-accent">
                    {link.label}
                  </a>
                ))}
              </nav>
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-body-2-regular text-text-tertiary">
            <span>© 2026 Juno</span>
            <span>Made for EmpowerHer: Building the Agent Economy</span>
          </div>
        </div>
      </footer>
    </>
  );
}
