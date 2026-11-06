import Link from "next/link";
import { Chip } from "@/components/base/badges/chip";
import type { Course } from "@/lib/courses";
import { cx } from "@/utils/cx";

export function CourseCard({ course, started = false, className }: { course: Course; started?: boolean; className?: string }) {
  return (
    <Link
      href={`/app/courses/${course.slug}`}
      className={cx(
        "flex min-h-11 flex-col gap-3 rounded-3xl border border-border-button-default bg-background-primary-default p-5 outline-none hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring",
        className,
      )}
    >
      <h3 className="text-title-3-medium">{course.title}</h3>
      <div className="flex items-center gap-2">
        <Chip variant="caption">{course.level}</Chip>
        <Chip variant="caption">{course.length}</Chip>
        {started && <Chip variant="caption" color="soft">In progress</Chip>}
      </div>
    </Link>
  );
}
