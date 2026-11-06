// Course details: what she'll learn, the milestones, the length, and Start course.
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import { startCourse } from "@/app/actions";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { PageSpinner } from "@/components/page-spinner";
import { courses, findCourse } from "@/lib/courses";
import { currentUser } from "@/lib/session";

export function generateStaticParams() {
  return courses.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/app/courses/[slug]">): Promise<Metadata> {
  const course = findCourse((await params).slug);
  return { title: course ? `${course.title} · juno` : "juno" };
}

export default function CourseDetails(props: PageProps<"/app/courses/[slug]">) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Details params={props.params} />
    </Suspense>
  );
}

async function Details({ params }: Pick<PageProps<"/app/courses/[slug]">, "params">) {
  const course = findCourse((await params).slug);
  if (!course) notFound();

  return (
    <main className="mx-auto flex w-full max-w-120 flex-col gap-8 pb-8">
      <Link
        href="/app"
        className="-ms-2 flex h-11 items-center gap-1 self-start rounded-full px-2 text-body-medium text-text-secondary outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <RiArrowLeftLine className="size-5" aria-hidden />
        Courses
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="text-title-1-medium">{course.title}</h1>
        <div className="flex items-center gap-2">
          <Chip variant="caption">{course.level}</Chip>
          <Chip variant="caption">{course.length}</Chip>
        </div>
        <p className="text-body-regular text-text-secondary">{course.summary}</p>
      </header>

      <section aria-labelledby="learn" className="flex flex-col gap-3">
        <h2 id="learn" className="text-headline-medium">What you&apos;ll learn</h2>
        <ul className="flex flex-col gap-2 text-body-regular text-text-secondary">
          {course.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-radiant" aria-hidden />
              {outcome}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="milestones" className="flex flex-col gap-3">
        <h2 id="milestones" className="text-headline-medium">Milestones</h2>
        <ol className="flex flex-col overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
          {course.milestones.map((milestone, index) => (
            <li key={milestone} className="flex items-center gap-3 border-b border-separator-border px-5 py-3.5 text-body-regular last:border-b-0">
              <span className="w-4 text-text-tertiary tabular-nums">{index + 1}</span>
              {milestone}
            </li>
          ))}
        </ol>
      </section>

      <Suspense fallback={<StartButton slug={course.slug} label="Start course" />}>
        <Start slug={course.slug} />
      </Suspense>
    </main>
  );
}

async function Start({ slug }: { slug: string }) {
  const user = await currentUser();
  return <StartButton slug={slug} label={user?.startedCourses.includes(slug) ? "Continue course" : "Start course"} />;
}

function StartButton({ slug, label }: { slug: string; label: string }) {
  return (
    <form action={startCourse.bind(null, slug)}>
      <Button type="submit" className="h-12 w-full rounded-full shadow-none">{label}</Button>
    </form>
  );
}
