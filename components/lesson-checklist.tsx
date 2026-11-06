// The lessons of her current module, each one a step she can tick off.
import { RiArrowRightUpLine, RiCheckLine } from "@remixicon/react";
import { completeLesson } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { Chip } from "@/components/base/badges/chip";
import { MENTOR_REVIEW_PRICE_LABEL, watchLink, type Course, type Module } from "@/lib/courses";
import { cx } from "@/utils/cx";

const pill = "rounded-full px-2.5 py-1 text-caption-1-regular";

export function LessonChecklist({ course, unit, done }: { course: Course; unit: Module; done: number[] }) {
  // The next lesson to do is the first one not ticked off (and not an optional review).
  const next = unit.lessons.findIndex((lesson, index) => lesson.kind !== "review" && !done.includes(index));
  return (
    <ol className="flex flex-col overflow-hidden rounded-2xl border border-line">
      {unit.lessons.map((lesson, index) => {
        const finished = done.includes(index);
        const review = lesson.kind === "review";
        return (
          <li
            key={lesson.title}
            aria-current={index === next ? "step" : undefined}
            className={cx("flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-5 py-4 last:border-b-0", index === next && "bg-mint")}
          >
            <span
              aria-hidden
              className={cx("flex size-6 shrink-0 items-center justify-center rounded-full", finished ? "bg-neon text-dark-green" : "border-2 border-separator-border")}
            >
              {finished && <RiCheckLine className="size-4" />}
            </span>
            <span className="flex min-w-40 flex-1 flex-col gap-0.5">
              <span className={cx("text-body-regular", index === next && "text-body-medium")}>{lesson.title}</span>
              <span className="text-body-2-regular text-text-tertiary">
                {review ? "Optional · a mentor looks at your work" : `${lesson.minutes} min`}
              </span>
            </span>
            {lesson.kind === "hands-on" && <Chip variant="caption" className={cx(pill, "border border-separator-border bg-transparent text-text-primary")}>Hands-on</Chip>}
            {review && <Chip variant="caption" className={cx(pill, "bg-purple text-dark-green")}>{MENTOR_REVIEW_PRICE_LABEL}</Chip>}
            {lesson.kind === "video" && (
              <a
                href={watchLink(course, lesson)}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center gap-1 rounded-lg px-1 text-body-medium text-green underline outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
              >
                Watch
                <RiArrowRightUpLine className="size-4" aria-hidden />
              </a>
            )}
            {!review && !finished && (
              <form action={completeLesson.bind(null, course.slug, index)}>
                <Button type="submit" variant={index === next ? "primary" : "secondary"} className="h-11 rounded-full px-4 shadow-none">
                  Mark done
                </Button>
              </form>
            )}
            {finished && <span className="text-body-2-regular text-text-secondary">Done</span>}
          </li>
        );
      })}
    </ol>
  );
}
