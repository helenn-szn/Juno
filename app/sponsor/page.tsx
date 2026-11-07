// The sponsor dashboard, from AppSponsor.dc.html. Every number comes from her wallet on
// Stellar and from what her learners and seats have really done.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RiAddLine, RiArrowRightUpLine, RiMailLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { CopyInvite } from "@/components/copy-invite";
import { FundByIdForm } from "@/components/fund-by-id";
import { Empty, PageGrid, Section } from "@/components/page-grid";
import { PageSpinner } from "@/components/page-spinner";
import { ProgressLine } from "@/components/progress";
import { TopBar } from "@/components/top-bar";
import { explorer } from "@/lib/constants";
import { currentUser } from "@/lib/session";
import { sponsorSummary, type LearnerRow } from "@/lib/sponsoring";
import { cx } from "@/utils/cx";

export const metadata: Metadata = { title: "Overview · juno" };

const usdc = (n: number) => n.toFixed(2);
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "short", day: "numeric" });

const status: Record<LearnerRow["status"], { label: string; chip: string }> = {
  learning: { label: "Learning", chip: "bg-radiant text-dark-green" },
  certified: { label: "Certified", chip: "bg-purple text-dark-green" },
  funding: { label: "Sending budget", chip: "border border-separator-border" },
  pending: { label: "Pending", chip: "border border-separator-border" },
};

const dot = { topup: "bg-radiant border border-coin-side", budget: "bg-radiant border border-coin-side", review: "bg-neon", certificate: "bg-purple" } as const;

export default function Overview() {
  return (
    <>
      <TopBar title="Overview" />
      <Suspense fallback={<PageSpinner />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "sponsor") redirect("/app");
  const s = await sponsorSummary(user.id);

  const tiles = [
    { label: "Total given", value: <>{usdc(s.totalGiven)} <span className="text-body-2-regular">USDC</span></>, tone: "text-green" },
    { label: "Learners", value: s.learnerCount, tone: "text-green" },
    { label: "Skill coins earned", value: s.coins, tone: "text-green" },
    { label: s.certificates === 1 ? "Certificate" : "Certificates", value: s.certificates, tone: "text-coin-newest-side" },
  ];

  return (
    <PageGrid
      main={
        <>
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3.5">
            {tiles.map((tile) => (
              <div key={tile.label} className="flex flex-col gap-1 rounded-2xl border border-line px-5 py-4">
                <dd className={cx("order-2 text-title-1-medium tracking-[-0.02em]", tile.tone)}>{tile.value}</dd>
                <dt className="order-1 text-body-2-regular text-text-secondary">{tile.label}</dt>
              </div>
            ))}
          </dl>

          <section id="learners" aria-labelledby="learners-title" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="learners-title" className="text-title-2-medium tracking-[-0.02em]">Your learners</h2>
              <ButtonLink href="/sponsor/invite" variant="secondary" leadingIcon={RiAddLine} className="h-11 rounded-full px-4 shadow-none">Invite a learner</ButtonLink>
            </div>
            {s.learners.length ? (
              <ul className="flex flex-col overflow-hidden rounded-2xl border border-line">
                {s.learners.map((learner) => (
                  <li key={learner.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-5 py-4 last:border-b-0">
                    <div className="flex min-w-50 flex-1 items-center gap-3">
                      <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-full text-body-medium", learner.status === "pending" ? "border border-dashed border-text-tertiary text-text-secondary" : "bg-purple")}>
                        {learner.status === "pending" ? <RiMailLine className="size-4" aria-hidden /> : learner.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-body-medium">{learner.name}</span>
                        <span className="text-body-2-regular text-text-secondary">
                          {learner.courseTitle} · {learner.status === "pending" ? "invite sent" : learner.how}
                        </span>
                      </div>
                    </div>
                    {learner.status === "pending" ? (
                      <>
                        <span className="min-w-40 flex-1 text-body-2-regular text-text-secondary">Hasn&apos;t joined yet</span>
                        <CopyInvite token={learner.token!} />
                      </>
                    ) : (
                      <>
                        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                          <div className="flex justify-between text-body-2-regular">
                            <span className="text-text-secondary">Progress</span>
                            <span>{learner.percent}%</span>
                          </div>
                          <ProgressLine percent={learner.percent} size="sm" label={`${learner.name}'s progress`} />
                        </div>
                        <span className="w-32 text-body-2-regular text-text-secondary">
                          {usdc(learner.used)} of {learner.budget} USDC used
                        </span>
                      </>
                    )}
                    <span className={cx("rounded-full px-2.5 py-1 text-caption-1-medium", status[learner.status].chip)}>{status[learner.status].label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No learners yet. Invite a woman you know, or open seats on a course.</Empty>
            )}
          </section>

          <section id="seats" aria-labelledby="seats-title" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="seats-title" className="text-title-2-medium tracking-[-0.02em]">Course seats</h2>
              <ButtonLink href="/sponsor/seats" variant="secondary" leadingIcon={RiAddLine} className="h-11 rounded-full px-4 shadow-none">Add seats</ButtonLink>
            </div>
            {s.pools.length ? (
              <ul className="flex flex-col gap-3.5">
                {s.pools.map((pool) => (
                  <li key={pool.id} className="flex flex-col gap-2 rounded-2xl border border-line p-5">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-body-medium">{pool.courseTitle}</span>
                      <span className="text-body-2-regular text-text-secondary">
                        {pool.taken} of {pool.seats} seats taken · {pool.budget} USDC each
                      </span>
                    </div>
                    <div className="flex gap-1.5" role="img" aria-label={`${pool.taken} of ${pool.seats} seats taken`}>
                      {Array.from({ length: pool.seats }, (_, seat) => (
                        <span key={seat} className={cx("h-2 flex-1 rounded-full", seat < pool.taken ? "bg-green" : "bg-line")} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No seats yet. Open seats and any woman who starts the course takes one.</Empty>
            )}
          </section>

          <Section title="Recent payments" id="payments">
            {s.payments.length ? (
              <ul className="flex flex-col overflow-hidden rounded-2xl border border-line">
                {s.payments.slice(0, 12).map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-3 last:border-b-0">
                    <span className="w-13 text-body-2-regular text-text-secondary">{day(payment.at)}</span>
                    <span className={cx("size-2.5 shrink-0 rounded-full", dot[payment.kind])} aria-hidden />
                    <span className="min-w-40 flex-1 text-body-regular">{payment.text}</span>
                    {payment.amount !== undefined && <span className="text-body-medium">{usdc(payment.amount)} USDC</span>}
                    <a href={explorer.tx(payment.tx)} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-1 text-body-2-medium text-green underline">
                      View on Stellar
                      <RiArrowRightUpLine className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Payments will show up here, each with a link to Stellar.</Empty>
            )}
          </Section>
        </>
      }
      side={
        <>
          <div id="wallet" className="on-dark flex flex-col gap-4 rounded-2xl bg-green p-5">
            <div className="flex flex-col gap-1 rounded-xl bg-dark-green p-4">
              <span className="text-body-2-regular text-text-tertiary">Sponsor wallet</span>
              <span className="text-display-4-medium tracking-[-0.03em] text-radiant">
                {usdc(s.balance)} <span className="text-body-regular">USDC</span>
              </span>
            </div>
            <ButtonLink href="/sponsor/fund" leadingIcon={RiAddLine} className="h-11 rounded-full shadow-none">Top up</ButtonLink>
            {s.address && (
              <a href={explorer.account(s.address)} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-1 text-body-2-medium text-radiant underline">
                See your wallet on Stellar
                <RiArrowRightUpLine className="size-4" aria-hidden />
              </a>
            )}
          </div>

          <FundByIdForm />

          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line p-5">
            <CoinFan theme="light" earned={Math.min(s.coins, 5)} label={`${Math.min(s.coins, 5)} of 5 skill coins`} className="w-44" />
            <p className="text-body-medium">{s.coins ? `${s.coins} ${s.coins === 1 ? "skill" : "skills"} minted by your learners` : "No skills minted yet"}</p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line p-5">
            <h2 className="text-title-3-medium">Where the money went</h2>
            {s.totalGiven ? (
              <>
                <div className="flex h-2.5 overflow-hidden rounded-full" role="img" aria-label={`${usdc(s.stillInWallets)} still in learners' wallets, ${usdc(s.paidToMentors)} paid to mentors`}>
                  <span className="bg-green" style={{ width: `${(s.stillInWallets / s.totalGiven) * 100}%` }} />
                  <span className="bg-neon" style={{ width: `${(s.paidToMentors / s.totalGiven) * 100}%` }} />
                </div>
                <dl className="flex flex-col gap-2 text-body-2-regular">
                  <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-green" aria-hidden /><dt className="flex-1">Still in learners&apos; wallets</dt><dd className="text-body-2-medium">{usdc(s.stillInWallets)}</dd></div>
                  <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-neon" aria-hidden /><dt className="flex-1">Paid to mentors</dt><dd className="text-body-2-medium">{usdc(s.paidToMentors)}</dd></div>
                </dl>
              </>
            ) : (
              <p className="text-body-regular text-text-secondary">Once a learner joins, you&apos;ll see where her budget goes.</p>
            )}
          </div>
        </>
      }
    />
  );
}
