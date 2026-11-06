import { Chip } from "@/components/base/badges/chip";
import { MENTOR_REVIEW_PRICE_LABEL, type Lesson } from "@/lib/courses";
import { cx } from "@/utils/cx";

const pill = "rounded-full px-2.5 py-1 text-caption-1-regular";

function Status({ lesson, watching }: { lesson: Lesson; watching: boolean }) {
  if (watching) return <Chip variant="caption" className={cx(pill, "bg-radiant text-dark-green")}>Watching</Chip>;
  if (lesson.kind === "hands-on") return <Chip variant="caption" className={cx(pill, "border border-separator-border bg-transparent text-text-primary")}>Hands-on</Chip>;
  if (lesson.kind === "review") return <Chip variant="caption" className={cx(pill, "bg-purple text-dark-green")}>{MENTOR_REVIEW_PRICE_LABEL}</Chip>;
  return null;
}

/** The lessons of one module: length, title, and what kind of lesson it is. */
export function LessonList({ lessons, started }: { lessons: Lesson[]; started: boolean }) {
  return (
    <ol className="flex flex-col overflow-hidden rounded-2xl border border-line">
      {lessons.map((lesson, index) => {
        const watching = started && index === 0;
        return (
          <li
            key={lesson.title}
            aria-current={watching ? "step" : undefined}
            className={cx(
              "flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-4 last:border-b-0",
              watching && "bg-mint",
            )}
          >
            <span className="w-14 text-body-regular text-text-tertiary tabular-nums">
              {lesson.minutes ? `${lesson.minutes} min` : "—"}
            </span>
            <span className={cx("min-w-40 flex-1 text-copy-sm", watching && "text-body-medium")}>{lesson.title}</span>
            <Status lesson={lesson} watching={watching} />
          </li>
        );
      })}
    </ol>
  );
}
