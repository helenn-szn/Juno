// Course details: a lesson player, what the course is about, this module's
// lessons, and on the right her progress, every module, and what she earns.
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RiPlayFill } from "@remixicon/react";
import { startCourse } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { CoinFan, CoinIcon } from "@/components/coin-fan";
import { LessonList } from "@/components/lesson-list";
import { ModuleList } from "@/components/module-list";
import { PageGrid, Section } from "@/components/page-grid";
import { PageSpinner } from "@/components/page-spinner";
import { ProgressLine, ProgressRing } from "@/components/progress";
import { TopBar } from "@/components/top-bar";
import { courses, findCourse, progressFor, youtubeThumbnail, type Course } from "@/lib/courses";
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
    <>
      <TopBar title={course.title} back={{ href: "/app/courses", label: "Back to courses" }} />
      <Suspense fallback={<PageSpinner />}>
        <Body course={course} />
      </Suspense>
    </>
  );
}

const mmss = (minutes = 0) => `${String(minutes).padStart(2, "0")}:00`;

async function Body({ course }: { course: Course }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const started = user.startedCourses.includes(course.slug);
  const progress = progressFor(course, user.modulesDone?.[course.slug] ?? 0);
  const unit = progress.currentModule ?? course.modules[course.modules.length - 1];
  const moduleNumber = course.modules.indexOf(unit) + 1;
  const lesson = unit.lessons[0];
  const start = startCourse.bind(null, course.slug);

  return (
    <PageGrid
      main={
        <>
          <div className="on-dark relative flex min-h-60 flex-col justify-between gap-6 overflow-hidden rounded-[20px] bg-green p-6 sm:aspect-video sm:p-7">
            {lesson.youtube ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail */}
                <img src={youtubeThumbnail(lesson.youtube)} alt="" className="absolute inset-0 size-full object-cover" />
                <div aria-hidden className="absolute inset-0 bg-footer/60" />
              </>
            ) : (
              <CoinFan surface="stroke-green" className="absolute -right-1 top-5 w-[40%] max-w-105 sm:top-auto sm:-right-[2%] sm:bottom-[14%] sm:w-[46%]" />
            )}
            <div className="relative flex max-w-[60%] flex-col gap-2.5">
              <span className="text-section leading-[1.05]">{lesson.title}</span>
              <span className="text-lead-sm font-medium text-radiant">
                Module {moduleNumber} · Lesson 1
              </span>
            </div>
            <div className="relative flex flex-col gap-3">
              <ProgressLine percent={0} size="sm" label="Lesson progress" />
              <div className="flex items-center gap-3">
                <form action={start}>
                  <Button type="submit" iconOnly leadingIcon={RiPlayFill} aria-label={started ? "Continue lesson" : "Start lesson"} className="size-11 rounded-full p-0 shadow-none" />
                </form>
                <span className="text-body-regular text-text-secondary tabular-nums">
                  00:00 / {mmss(lesson.minutes)}
                </span>
              </div>
            </div>
          </div>

          <Section title="About this course" id="about">
            <p className="max-w-170 text-copy text-text-secondary">{course.summary}</p>
          </Section>

          <Section title={`Module ${moduleNumber} lessons`} id="lessons">
            <LessonList lessons={unit.lessons} started={started} />
          </Section>
        </>
      }
      side={
        <>
          <div className="on-dark flex flex-col items-center gap-4 rounded-2xl bg-green p-5.5">
            <h2 className="self-start text-title-3-medium">Course progress</h2>
            <ProgressRing percent={progress.percent} />
            <span className="text-body-regular text-text-secondary">
              {progress.done} of {course.modules.length} modules
            </span>
            <form action={start} className="w-full">
              <Button type="submit" className="h-12 w-full rounded-full text-headline-medium shadow-none">
                {started ? "Continue learning" : "Start course"}
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-line p-5">
            <h2 className="mb-2 text-title-3-medium">Modules</h2>
            <ModuleList course={course} done={progress.done} />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line p-5">
            <h2 className="mb-1 text-title-3-medium">You earn</h2>
            <p className="flex items-center gap-3 text-copy-sm">
              <CoinIcon className="h-7.5 w-6.5" />
              <span className="flex-1">Skill coins</span>
              <span className="text-body-medium">{course.modules.length}</span>
            </p>
            <p className="flex items-center gap-3 text-copy-sm">
              <CoinIcon tone="newest" className="h-7.5 w-6.5" />
              <span className="flex-1">Certificate</span>
              <span className="text-body-medium">1</span>
            </p>
          </div>
        </>
      }
    />
  );
}
