// A mentor's profile: how learners see her. (Edit prices on the Prices page.)
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { findCourse } from "@/lib/courses";
import { FORMATS, FORMAT_KEYS } from "@/lib/mentors-shared";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profile · juno" };

export default function Profile() {
  return (
    <>
      <TopBar title="Profile" />
      <Suspense fallback={<PageSpinner />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "mentor" || !user.mentor || user.mentor.status === "changes") redirect("/app");
  const m = user.mentor;
  return (
    <div className="flex max-w-160 flex-col gap-6 p-6 lg:p-7">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} src={user.avatar} className="size-16 text-title-2-medium" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="truncate text-title-2-medium">{user.name}</h2>
          <span className="text-copy-sm text-text-secondary">
            {m.country} · Mentor ID <span className="font-mono tracking-[0.06em]">{m.mentorId}</span>
          </span>
        </div>
      </div>
      <p className="text-copy">{m.bio}</p>
      <dl className="flex flex-col gap-4 text-copy-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-body-medium">Courses you review</dt>
          <dd>{m.courses.map((slug) => findCourse(slug)?.title).filter(Boolean).join(", ")}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-body-medium">Prices</dt>
          <dd>{FORMAT_KEYS.filter((f) => m.prices[f] !== undefined).map((f) => `${FORMATS[f].label} ${m.prices[f]!.toFixed(2)} USDC`).join(" · ")}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-body-medium">Your work</dt>
          <dd><a href={m.link} target="_blank" rel="noreferrer" className="text-green underline">{m.link}</a></dd>
        </div>
      </dl>
      <a href="/app/prices" className="flex min-h-11 items-center self-start text-body-medium text-green underline">Edit prices and courses</a>
    </div>
  );
}
