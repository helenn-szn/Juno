import Link from "next/link";
import { CourseIconTile } from "@/components/course-cover";
import { ProgressLine } from "@/components/progress";
import { progressFor, timeLeft, type Course } from "@/lib/courses";

/** A course she has started: progress, time left, and a way back in. */
export function ContinueCard({ course, done }: { course: Course; done: number }) {
  const progress = progressFor(course, done);
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl bg-green p-5">
      <div className="flex items-center gap-3">
        <CourseIconTile icon={course.icon} cover={course.cover} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-headline-medium">{course.title}</span>
          <span className="text-caption-1-regular tracking-[0.08em] text-text-tertiary uppercase">{course.topic}</span>
        </div>
      </div>
      <ProgressLine percent={progress.percent} label={`${course.title} progress`} />
      <div className="flex justify-between text-body-2-regular text-text-secondary">
        <span>
          {progress.done}/{course.modules.length} modules
        </span>
        <span>{timeLeft(progress.minutesLeft)}</span>
      </div>
      <Link
        href={`/app/courses/${course.slug}/learn`}
        className="flex min-h-11 items-center rounded-lg text-body-medium text-radiant outline-none hover:text-mint focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        Resume course →
      </Link>
    </div>
  );
}
