import Link from "next/link";
import { Chip } from "@/components/base/badges/chip";
import { CourseCoverImage, CourseIconTile } from "@/components/course-cover";
import { moduleCount, type Course } from "@/lib/courses";
import { cx } from "@/utils/cx";

const ring = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

/** A course in the "Recommended" and "Courses" grids. */
export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/app/courses/${course.slug}`}
      className={cx("flex h-full flex-col overflow-hidden rounded-2xl border border-line hover:border-text-tertiary", ring)}
    >
      <div className="relative">
        <CourseCoverImage icon={course.icon} cover={course.cover} />
        {course.isNew && (
          <Chip variant="caption" className="absolute start-3 top-3 rounded-full bg-radiant px-2.5 text-dark-green">
            New
          </Chip>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-headline-medium">{course.title}</h3>
        <p className="text-body-2-regular text-text-tertiary">
          {course.level} · {moduleCount(course)}
        </p>
      </div>
    </Link>
  );
}

/** A course inside a Juno.ai reply: small, one tap to open Course details. */
export function CourseRow({ course, onOpen }: { course: Course; onOpen?: () => void }) {
  return (
    <Link
      href={`/app/courses/${course.slug}`}
      onClick={onOpen}
      className={cx("flex min-h-14 items-center gap-3 rounded-2xl bg-dark-green p-2.5 hover:bg-dark-green/70", ring)}
    >
      <CourseIconTile icon={course.icon} cover={course.cover} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body-medium">{course.title}</span>
        <span className="text-caption-1-regular text-text-tertiary">
          {course.level} · {moduleCount(course)}
        </span>
      </span>
    </Link>
  );
}
