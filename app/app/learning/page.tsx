// Every course she has started.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/base/buttons/button";
import { ContinueCard } from "@/components/continue-card";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { courses } from "@/lib/courses";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "My learning · juno" };

export default function Learning() {
  return (
    <>
      <TopBar title="My learning" />
      <Suspense fallback={<PageSpinner />}>
        <Started />
      </Suspense>
    </>
  );
}

async function Started() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const started = courses.filter((course) => user.startedCourses.includes(course.slug));

  return (
    <div className="p-6 lg:p-7">
      {started.length ? (
        <div className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
          {started.map((course) => (
            <ContinueCard key={course.slug} course={course} done={user.modulesDone?.[course.slug] ?? 0} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line px-5 py-6">
          <p className="text-body-regular text-text-secondary">You haven&apos;t started a course yet.</p>
          <ButtonLink href="/app/courses" className="h-11 rounded-full px-5 shadow-none">
            Browse courses
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
