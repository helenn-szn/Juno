// Where a started course lives: this module's overview, lessons and free reading,
// with her study agent beside it. Finishing every module earns her certificate.
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { RiArrowRightUpLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { LessonChecklist } from "@/components/lesson-checklist";
import { ModuleList } from "@/components/module-list";
import { PlanCard } from "@/components/plan-card";
import { PageSpinner } from "@/components/page-spinner";
import { Section } from "@/components/page-grid";
import { ProgressLine } from "@/components/progress";
import { StudyPanel } from "@/components/study-panel";
import { TopBar } from "@/components/top-bar";
import { certificatesFor } from "@/lib/certificates";
import { courses, findCourse, progressFor } from "@/lib/courses";
import { buildPlan, shortDate } from "@/lib/plan";
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
  await connection(); // the plan depends on today's date
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.profile) redirect(`/app/onboarding?next=${slug}`);

  const done = user.modulesDone?.[slug] ?? 0;
  const progress = progressFor(course, done);
  const unit = progress.currentModule;

  if (!unit) {
    const certificate = (await certificatesFor(user.id)).find((c) => c.courseSlug === slug);
    return (
      <div className="flex max-w-170 flex-col items-start gap-4 p-6 lg:p-7">
        <h2 className="text-title-1-medium tracking-[-0.03em]">You finished {course.title}.</h2>
        <p className="text-copy text-text-secondary">Skill minted. That&apos;s yours forever.</p>
        <ButtonLink href={certificate ? `/app/certificates/${certificate.id}` : "/app/certificates"} className="h-11 rounded-full px-5 shadow-none">
          View certificate
        </ButtonLink>
      </div>
    );
  }

  const moduleNumber = done + 1;
  const plan = buildPlan(course, user.profile, done);
  return (
    <div className="grid items-start gap-7 p-6 lg:p-7 min-[1100px]:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 max-w-170 flex-col gap-9">
        <section aria-labelledby="module" className="flex flex-col gap-3">
          <span className="text-body-2-regular text-text-secondary">
            Module {moduleNumber} of {course.modules.length}
          </span>
          <h2 id="module" className="text-title-1-medium tracking-[-0.03em]">
            {unit.title}
          </h2>
          <p className="text-copy text-text-secondary">{unit.overview}</p>
          <p className="text-body-medium text-green">Aim to finish this module by {shortDate(plan.due[0])}.</p>
          <ProgressLine percent={progress.percent} size="sm" label="Course progress" />
        </section>

        <PlanCard plan={plan} profile={user.profile} />

        <Section title="Lessons" id="lessons">
          <LessonChecklist course={course} unit={unit} done={user.lessonsDone?.[slug] ?? []} />
        </Section>

        <Section title="Free reading" id="resources">
          <ul className="flex flex-col overflow-hidden rounded-2xl border border-line">
            {unit.resources.map((resource) => (
              <li key={resource.url} className="border-b border-line last:border-b-0">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-14 items-center gap-3 px-5 py-3 outline-none hover:bg-mint focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-inset"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-body-regular">{resource.title}</span>
                    <span className="text-body-2-regular text-text-tertiary">
                      {resource.kind} · {new URL(resource.url).hostname.replace(/^www\./, "")}
                    </span>
                  </span>
                  <RiArrowRightUpLine className="size-5 shrink-0 text-text-tertiary" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Course outline" id="outline">
          <div className="rounded-2xl border border-line px-5 py-3">
            <ModuleList course={course} done={done} />
          </div>
          <Link href={`/app/courses/${slug}`} className="flex min-h-11 items-center self-start text-body-medium text-green underline">
            About this course
          </Link>
        </Section>
      </div>
      <StudyPanel course={slug} stuckOn={unit.title} />
    </div>
  );
}
