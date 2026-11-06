import { RiCheckLine, RiLockLine } from "@remixicon/react";
import { moduleState, type Course, type ModuleState } from "@/lib/courses";
import { cx } from "@/utils/cx";

const labels: Record<ModuleState, string> = { done: "Done", current: "In progress", todo: "Not started", locked: "Locked" };

function StateIcon({ state }: { state: ModuleState }) {
  if (state === "done")
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-neon text-dark-green">
        <RiCheckLine className="size-3.5" aria-hidden />
      </span>
    );
  if (state === "locked") return <RiLockLine className="size-5 text-text-tertiary" aria-hidden />;
  return <span className={cx("size-5 rounded-full border-2", state === "current" ? "border-[3px] border-green" : "border-separator-border")} />;
}

/** Every module of a course with where she is: done, current, not started or locked. */
export function ModuleList({ course, done }: { course: Course; done: number }) {
  return (
    <ol className="flex flex-col">
      {course.modules.map((module, index) => {
        const state = moduleState(course, index, done);
        return (
          <li
            key={module.title}
            aria-current={state === "current" ? "step" : undefined}
            className={cx(
              "flex min-h-10 items-center gap-3 text-body-regular",
              state === "current" && "text-body-medium text-green",
              state === "locked" && "text-text-tertiary",
            )}
          >
            <span className="flex-1">
              {index + 1}. {module.title}
            </span>
            <StateIcon state={state} />
            <span className="sr-only">{labels[state]}</span>
          </li>
        );
      })}
    </ol>
  );
}
