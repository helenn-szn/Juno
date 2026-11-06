// Where a started course lives. The study agent, mentor reviews and skill coins land here next.
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { PageSpinner } from "@/components/page-spinner";
import { courses, findCourse } from "@/lib/courses";

export function generateStaticParams() {
  return courses.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/app/courses/[slug]/learn">): Promise<Metadata> {
  const course = findCourse((await params).slug);
  return { title: course ? `${course.title} · juno` : "juno" };
}

export default function Learn(props: PageProps<"/app/courses/[slug]/learn">) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Milestones params={props.params} />
    </Suspense>
  );
}

async function Milestones({ params }: Pick<PageProps<"/app/courses/[slug]/learn">, "params">) {
  const course = findCourse((await params).slug);
  if (!course) notFound();

  return (
    <main className="mx-auto flex w-full max-w-120 flex-col gap-8 pb-8">
      <Link
        href={`/app/courses/${course.slug}`}
        className="-ms-2 flex h-11 items-center gap-1 self-start rounded-full px-2 text-body-medium text-text-secondary outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <RiArrowLeftLine className="size-5" aria-hidden />
        {course.title}
      </Link>
      <h1 className="text-title-1-medium">Milestones</h1>
      <ol className="flex flex-col overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
        {course.milestones.map((milestone, index) => (
          <li key={milestone} className="flex items-center justify-between gap-3 border-b border-separator-border px-5 py-3.5 text-body-regular last:border-b-0">
            <span className="flex gap-3">
              <span className="w-4 text-text-tertiary tabular-nums">{index + 1}</span>
              {milestone}
            </span>
            {index === 0 && <Chip variant="caption">Up next</Chip>}
          </li>
        ))}
      </ol>
    </main>
  );
}
