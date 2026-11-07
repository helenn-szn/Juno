// The mentor dashboard, from AppMentor.dc.html. Every number comes from her requests and her wallet on Stellar.
import { Suspense } from "react";
import { AnswerButtons, DeliveryBox, TakingSwitch, WelcomeBanner, WithdrawBox } from "@/components/mentor-actions";
import { CoinFan } from "@/components/coin-fan";
import { Empty, PageGrid, Section } from "@/components/page-grid";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { explorer } from "@/lib/constants";
import { findCourse } from "@/lib/courses";
import { mentorStats, requestsForMentor } from "@/lib/mentors";
import { FORMATS, FORMAT_KEYS, rightNow, timeLeft, type ReviewRequest } from "@/lib/mentors-shared";
import { usdcBalanceOrZero } from "@/lib/stellar";
import type { User } from "@/lib/users";
import { cx } from "@/utils/cx";

const money = (n: number) => n.toFixed(2);
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
const tints = ["bg-purple", "bg-radiant", "bg-neon"];
const tint = (name: string) => tints[name.charCodeAt(0) % tints.length];
const chip = "rounded-full border border-paper-line px-2.5 py-1 text-body-2-medium";
const link = "text-body-2-medium text-green underline outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

export function MentorHome({ user }: { user: User }) {
  return (
    <>
      <TopBar title="Requests" before={<TakingSwitch on={user.mentor?.takingRequests ?? true} />} />
      <Suspense fallback={<PageSpinner />}>
        <Content user={user} />
      </Suspense>
    </>
  );
}

function Who({ r }: { r: ReviewRequest }) {
  return (
    <div className="flex min-w-0 grow basis-55 items-center gap-3">
      <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-full text-body-medium", tint(r.learnerName))}>{r.learnerName[0]}</span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-body-medium">{r.learnerName} · {r.courseTitle}</span>
        <span className="truncate text-body-2-regular text-text-secondary">{r.lesson}</span>
      </div>
    </div>
  );
}

async function Content({ user }: { user: User }) {
  const mentor = user.mentor!;
  const requests = await requestsForMentor(user.id);
  const now = rightNow();
  const stats = mentorStats(requests, now);
  const balance = user.wallet ? await usdcBalanceOrZero(user.wallet.publicKey) : 0;

  const incoming = requests.filter((r) => r.status === "requested");
  const working = requests.filter((r) => r.status === "accepted");
  const finished = requests.filter((r) => r.status === "delivered");
  const missedReplies = requests.filter((r) => r.status === "expired").length;
  const overdue = working.filter((r) => r.dueAt && new Date(r.dueAt).getTime() < now).length;
  const first = user.name.split(" ")[0];

  const earnings = [
    ...requests.filter((r) => r.payTx && r.status !== "refunded").map((r) => ({ at: r.acceptedAt!, label: `${r.learnerName} · ${FORMATS[r.format].label.toLowerCase()}`, amount: r.price, tx: r.payTx!, kind: "in" as const })),
    ...(mentor.withdrawals ?? []).map((w) => ({ at: w.at, label: "Withdrawn to your wallet", amount: w.amount, tx: w.tx, kind: "out" as const })),
  ]
    .sort((a, b) => (b.at > a.at ? 1 : -1))
    .slice(0, 8);

  const courseNames = mentor.courses.map((slug) => findCourse(slug)?.title).filter(Boolean).join(", ");
  const tiles = [
    { label: "Earned this month", value: <>{money(stats.earnedThisMonth)} <span className="text-body-2-regular">USDC</span></>, tone: "text-green" },
    { label: "Reviews done", value: stats.done, tone: "text-green" },
    { label: "Skill coins you unlocked", value: stats.done, tone: "text-coin-newest-side" },
    { label: "Average reply", value: stats.averageReply, tone: "text-green" },
  ];

  return (
    <PageGrid
      main={
        <>
          {!mentor.welcomed && <WelcomeBanner name={first} courses={courseNames} />}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3.5">
            {tiles.map((tile) => (
              <div key={tile.label} className="flex flex-col gap-1 rounded-2xl border border-line px-5 py-4">
                <span className="text-body-2-regular text-text-secondary">{tile.label}</span>
                <span className={cx("text-title-2-medium tracking-[-0.02em]", tile.tone)}>{tile.value}</span>
              </div>
            ))}
          </div>

          <Section title="New requests" id="requests">
            {incoming.length ? (
              <div className="overflow-hidden rounded-2xl border border-line">
                {incoming.map((r, index) => {
                  const left = timeLeft(r.expiresAt, now);
                  return (
                    <details key={r.id} open={index === 0} className="group border-b border-line last:border-b-0">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
                        <Who r={r} />
                        <span className={chip}>{FORMATS[r.format].label}</span>
                        <span className="text-body-medium">{money(r.price)} USDC</span>
                        <span className={cx("text-body-2-regular", left.urgent ? "text-field-error" : "text-text-secondary")}>{left.text}</span>
                      </summary>
                      <div className="flex flex-col gap-3 px-5 pb-4">
                        <p className="rounded-xl bg-mint px-3.5 py-3 text-copy-sm">
                          <b className="font-medium">Her agent says:</b> {r.message}
                        </p>
                        <AnswerButtons id={r.id} price={money(r.price)} />
                      </div>
                    </details>
                  );
                })}
              </div>
            ) : (
              <Empty>
                {mentor.takingRequests
                  ? "No new requests right now. When a learner's agent books you, it shows up here and you're paid the moment you accept."
                  : "You're not taking requests. Turn “Taking requests” back on in the header when you're ready."}
              </Empty>
            )}
          </Section>

          <Section title="In progress" id="progress">
            {working.length ? (
              working.map((r) => {
                const left = timeLeft(r.dueAt!, now);
                return (
                  <div key={r.id} className="flex flex-col gap-4 rounded-2xl border-2 border-green p-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                      <Who r={r} />
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-neon px-3 py-1.25 text-body-2-medium text-dark-green">
                        <span className="size-2 rounded-full bg-dark-green" aria-hidden />
                        Paid {money(r.price)} USDC
                      </span>
                      <a href={explorer.tx(r.payTx!)} target="_blank" rel="noreferrer" className={link}>View on Stellar</a>
                      <span className={cx("text-body-2-regular", left.urgent ? "text-field-error" : "text-text-secondary")}>{left.text.replace("left", "to deliver")}</span>
                    </div>
                    <p className="text-copy-sm text-text-secondary">{FORMATS[r.format].label} · “{r.message}”</p>
                    <DeliveryBox id={r.id} format={r.format} learner={r.learnerName} />
                  </div>
                );
              })
            ) : (
              <Empty>Reviews you&apos;ve accepted wait here until you send them.</Empty>
            )}
          </Section>

          <Section title="Reviews done" id="done">
            {finished.length ? (
              <ul className="m-0 list-none overflow-hidden rounded-2xl border border-line p-0">
                {finished.map((r) => (
                  <li key={r.id} className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-2 last:border-b-0">
                    <span className="w-13 text-body-2-regular text-text-secondary">{day(r.deliveredAt!)}</span>
                    <span className="size-2.5 shrink-0 rounded-full bg-purple" aria-hidden />
                    <span className="min-w-40 flex-1 text-copy-sm">{r.learnerName} · {r.courseTitle}</span>
                    {r.skillTx && <a href={explorer.tx(r.skillTx)} target="_blank" rel="noreferrer" className={link}>Skill coin on Stellar</a>}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Your finished reviews, and the skill coins they minted, will be listed here.</Empty>
            )}
          </Section>

          <Section title="Recent earnings" id="earnings">
            {earnings.length ? (
              <ul className="m-0 list-none overflow-hidden rounded-2xl border border-line p-0">
                {earnings.map((e) => (
                  <li key={e.tx + e.at} className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-2 last:border-b-0">
                    <span className="w-13 text-body-2-regular text-text-secondary">{day(e.at)}</span>
                    <span className={cx("size-2.5 shrink-0 rounded-full", e.kind === "in" ? "bg-neon" : "bg-purple")} aria-hidden />
                    <span className="min-w-40 flex-1 text-copy-sm">{e.label}</span>
                    <span className={cx("text-body-medium", e.kind === "out" && "text-text-secondary")}>{e.kind === "in" ? "+" : "−"}{money(e.amount)} USDC</span>
                    <a href={explorer.tx(e.tx)} target="_blank" rel="noreferrer" className={link}>View on Stellar</a>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Your first payment lands here the moment you accept a request.</Empty>
            )}
          </Section>
        </>
      }
      side={
        <>
          <div className="on-dark flex flex-col gap-4 rounded-2xl bg-green p-5 text-mint">
            <div className="flex flex-col gap-1 rounded-xl bg-dark-green p-4">
              <span className="text-body-2-regular text-text-tertiary">Mentor wallet</span>
              <span className="text-display-4-medium tracking-[-0.03em] text-radiant">{money(balance)} <span className="text-body-regular">USDC</span></span>
              <span className="text-body-2-regular text-text-tertiary">Mentor ID <span className="font-mono tracking-[0.06em] text-mint">{mentor.mentorId}</span></span>
            </div>
            <WithdrawBox balance={balance} />
          </div>

          <div id="prices" className="flex flex-col gap-3 rounded-2xl border border-line p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-body-medium">Your prices</h2>
              <a href="/app/prices" className={link}>Edit prices</a>
            </div>
            <div className="flex flex-col gap-2.5 text-copy-sm">
              {FORMAT_KEYS.filter((f) => mentor.prices[f] !== undefined).map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <span className={cx("size-2.5 rounded-full", f === "written" ? "bg-radiant" : f === "voice" ? "bg-neon" : "bg-purple")} aria-hidden />
                  <span className="flex-1">{FORMATS[f].label}</span>
                  <span className="font-medium">{money(mentor.prices[f]!)}</span>
                </div>
              ))}
            </div>
            <span className="text-body-2-regular text-text-secondary">All prices in USDC</span>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line p-5 text-center">
            <CoinFan theme="light" label="Skill coins you helped unlock" earned={Math.min(5, stats.done)} className="h-30.5 w-44" />
            <span className="text-body-medium">
              {stats.done ? `You've helped ${stats.women} ${stats.women === 1 ? "woman" : "women"} earn ${stats.done} ${stats.done === 1 ? "skill" : "skills"}` : "Your first skill coin is one review away"}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-line p-5">
            <h2 className="text-body-medium">Your promise</h2>
            <div className="flex justify-between text-copy-sm"><span>Reply within 24 h</span><span className={cx("font-medium", missedReplies ? "text-field-error" : "text-green")}>{missedReplies ? `${missedReplies} missed` : "On track"}</span></div>
            <div className="flex justify-between text-copy-sm"><span>Deliver within 48 h</span><span className={cx("font-medium", overdue ? "text-field-error" : "text-green")}>{overdue ? `${overdue} overdue` : "On track"}</span></div>
          </div>
        </>
      }
    />
  );
}

