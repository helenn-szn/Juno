// Where a started course lives: this module's lessons, and her study agent.
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonList } from "@/components/lesson-list";
import { StudyAgent } from "@/components/study-agent";
import { PageSpinner } from "@/components/page-spinner";
import { Section } from "@/components/page-grid";
import { TopBar } from "@/components/top-bar";
import { courses, findCourse, progressFor } from "@/lib/courses";
import { currentUser } from "@/lib/session";

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
      <Lessons params={props.params} />
    </Suspense>
  );
}

async function Lessons({ params }: Pick<PageProps<"/app/courses/[slug]/learn">, "params">) {
  const { slug } = await params;
  const course = findCourse(slug);
  if (!course) notFound();

  return (
    <>
      <TopBar title={course.title} back={{ href: `/app/courses/${course.slug}`, label: `Back to ${course.title}` }} />
      <Suspense fallback={<PageSpinner />}>
        <Current slug={course.slug} />
      </Suspense>
    </>
  );
}

async function Current({ slug }: { slug: string }) {
  const course = findCourse(slug)!;
  const user = await currentUser();
  const progress = progressFor(course, user?.modulesDone?.[slug] ?? 0);
  const unit = progress.currentModule ?? course.modules[course.modules.length - 1];

  return (
    <div className="flex max-w-170 flex-col gap-9 p-6 lg:p-7">
      <Section title={`Module ${course.modules.indexOf(unit) + 1}: ${unit.title}`} id="lessons">
        <LessonList lessons={unit.lessons} started />
      </Section>
      <Section title="Study agent" id="agent">
        <StudyAgent course={course.slug} stuckOn={unit.title} />
      </Section>
    </div>
  );
}
