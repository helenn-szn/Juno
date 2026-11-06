// The learner's dashboard: what she's learning, what to try next, her wallet and her coins.
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ContinueCard } from "@/components/continue-card";
import { CoinFan } from "@/components/coin-fan";
import { CourseCard } from "@/components/course-card";
import { Empty, PageGrid, Section } from "@/components/page-grid";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { WalletBalance } from "@/components/wallet-balance";
import { courses } from "@/lib/courses";
import { currentUser } from "@/lib/session";

export default function Dashboard() {
  return (
    <>
      <TopBar title="Dashboard" search />
      <Suspense fallback={<PageSpinner />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const doneOf = (slug: string) => user.modulesDone?.[slug] ?? 0;
  const started = courses.filter((course) => user.startedCourses.includes(course.slug));
  const inProgress = started.filter((course) => doneOf(course.slug) < course.modules.length);
  const finished = started.length - inProgress.length;
  const coins = started.reduce((total, course) => total + doneOf(course.slug), 0);
  const next = courses.filter((course) => !user.startedCourses.includes(course.slug));

  return (
    <PageGrid
      main={
        <>
          <Section title="Continue learning" id="continue">
            {inProgress.length ? (
              <div className="grid gap-3.5 sm:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
                {inProgress.map((course) => (
                  <ContinueCard key={course.slug} course={course} done={doneOf(course.slug)} />
                ))}
              </div>
            ) : (
              <Empty>Nothing in progress yet. Pick a course below.</Empty>
            )}
          </Section>
          <Section title="Recommended for you" id="recommended">
            {next.length ? (
              <ul className="grid gap-3.5 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
                {next.map((course) => (
                  <li key={course.slug}>
                    <CourseCard course={course} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>You&apos;ve started every course. Well done!</Empty>
            )}
          </Section>
        </>
      }
      side={
        <>
          <div className="on-dark flex flex-col gap-4 rounded-2xl bg-green p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-13 items-center justify-center rounded-full bg-purple text-title-3-medium text-dark-green" aria-hidden>
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate text-title-3-medium">{user.name.split(" ")[0]}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-dark-green p-4">
              <span className="text-body-2-regular text-text-tertiary">Learning wallet</span>
              <Suspense fallback={<span className="h-9" aria-label="Loading balance" />}>
                <WalletBalance address={user.wallet?.publicKey} className="text-display-4-medium tracking-[-0.03em] text-radiant" />
              </Suspense>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line p-5">
            <CoinFan theme="light" earned={Math.min(coins, 5)} label={`${Math.min(coins, 5)} of 5 skill coins earned`} className="w-50" />
            <p className="text-body-medium">{coins ? `${coins} ${coins === 1 ? "skill" : "skills"} minted` : "No skills minted yet"}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1 rounded-2xl border border-line p-4.5">
              <dd className="text-display-4-medium text-green">{inProgress.length}</dd>
              <dt className="text-body-2-regular text-text-secondary">In progress</dt>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-line p-4.5">
              <dd className="text-display-4-medium text-coin-newest-side">{finished}</dd>
              <dt className="text-body-2-regular text-text-secondary">{finished === 1 ? "Certificate" : "Certificates"}</dt>
            </div>
          </dl>
        </>
      }
    />
  );
}
