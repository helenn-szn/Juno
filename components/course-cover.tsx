import {
  RiBarChartLine,
  RiBox3Line,
  RiChat3Line,
  RiCodeSSlashLine,
  RiRobot2Line,
  RiShareLine,
} from "@remixicon/react";
import type { CourseCover, CourseIcon } from "@/lib/courses";
import { cx } from "@/utils/cx";

const icons = {
  robot: RiRobot2Line,
  chat: RiChat3Line,
  nodes: RiShareLine,
  python: RiCodeSSlashLine,
  chart: RiBarChartLine,
  blocks: RiBox3Line,
};

// Each cover colour comes with the icon colour that reads well on it.
const covers: Record<CourseCover, string> = {
  purple: "bg-purple text-dark-green",
  radiant: "bg-radiant text-dark-green",
  neon: "bg-neon text-dark-green",
  green: "bg-green text-radiant",
  mint: "bg-mint text-green",
  forest: "bg-forest text-purple",
};

/** The big coloured cover on a course card. */
export function CourseCoverImage({ icon, cover, className }: { icon: CourseIcon; cover: CourseCover; className?: string }) {
  const Icon = icons[icon];
  return (
    <div className={cx("flex h-37.5 items-center justify-center", covers[cover], className)}>
      <Icon className="size-20" aria-hidden />
    </div>
  );
}

/** The small square icon on "Continue learning" and chat cards. */
export function CourseIconTile({ icon, cover, className }: { icon: CourseIcon; cover: CourseCover; className?: string }) {
  const Icon = icons[icon];
  return (
    <span className={cx("flex size-11 shrink-0 items-center justify-center rounded-xl", covers[cover], className)}>
      <Icon className="size-5.5" aria-hidden />
    </span>
  );
}
