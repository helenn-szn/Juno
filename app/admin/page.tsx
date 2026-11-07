// The Juno team's page (demo): approve mentors with one click, ask for changes ("Not yet"),
// and refund a learner when a mentor missed the 48 hours.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { RefundButton, ReviewApplication } from "@/components/admin-buttons";
import { Empty, Section } from "@/components/page-grid";
import { PageSpinner } from "@/components/page-spinner";
import { findCourse } from "@/lib/courses";
import { allRequests } from "@/lib/mentors";
import { FORMATS, FORMAT_KEYS, rightNow } from "@/lib/mentors-shared";
import { currentUser } from "@/lib/session";
import { listMentors } from "@/lib/users";

export const metadata: Metadata = { title: "Team · juno" };
// Refunding sends USDC on Stellar, which can take a moment.
export const maxDuration = 60;

export default function Admin() {
  return (
    <div className="app-light min-h-dvh bg-background-full text-text-primary">
      <AdminHeader />
      <Suspense fallback={<PageSpinner />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const user = await currentUser();
  if (user?.role !== "admin") redirect(user ? "/app" : "/login");
  const [mentors, requests] = await Promise.all([listMentors(), allRequests()]);
  const waiting = mentors.filter((m) => m.mentor?.status === "review");
  const now = rightNow();
  const late = requests.filter((r) => r.status === "accepted" && r.dueAt && new Date(r.dueAt).getTime() < now);

  return (
    <div className="mx-auto flex max-w-200 flex-col gap-9 p-6 lg:p-7">
      <Section title="Mentor applications" id="applications">
        {waiting.length ? (
          waiting.map((m) => (
            <article key={m.id} className="flex flex-col gap-4 rounded-2xl border border-line p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-title-3-medium">{m.name}</h3>
                <span className="text-copy-sm text-text-secondary">{m.mentor!.country} · {m.mentor!.mentorId} · {m.email}</span>
              </div>
              <p className="text-copy-sm">{m.mentor!.bio}</p>
              <dl className="flex flex-col gap-1 text-copy-sm">
                <div><dt className="inline font-medium">Courses: </dt><dd className="inline">{m.mentor!.courses.map((s) => findCourse(s)?.title).join(", ")}</dd></div>
                <div><dt className="inline font-medium">Prices: </dt><dd className="inline">{FORMAT_KEYS.filter((f) => m.mentor!.prices[f] !== undefined).map((f) => `${FORMATS[f].short} ${m.mentor!.prices[f]!.toFixed(2)}`).join(" · ")}</dd></div>
                <div><dt className="inline font-medium">Work: </dt><dd className="inline"><a href={m.mentor!.link} target="_blank" rel="noreferrer" className="text-green underline">{m.mentor!.link}</a></dd></div>
              </dl>
              <ReviewApplication userId={m.id} />
            </article>
          ))
        ) : (
          <Empty>No applications waiting. New ones show up here.</Empty>
        )}
      </Section>

      <Section title="Late reviews" id="late">
        {late.length ? (
          late.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line p-5">
              <div className="flex min-w-0 grow basis-60 flex-col gap-0.5">
                <span className="text-body-medium">{r.learnerName} · {r.courseTitle}</span>
                <span className="text-body-2-regular text-text-secondary">{FORMATS[r.format].label} · {r.price.toFixed(2)} USDC · due {new Date(r.dueAt!).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <RefundButton requestId={r.id} />
            </div>
          ))
        ) : (
          <Empty>No review is past its 48 hours.</Empty>
        )}
      </Section>
    </div>
  );
}
