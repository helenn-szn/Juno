"use client";

import { RiSearchLine } from "@remixicon/react";
import { Input } from "@/components/base/input/input";
import { touchInput } from "@/components/touch-input";
import { cx } from "@/utils/cx";

/** The search box in the top bar. It sends her to the Courses page with ?q=. */
export function CourseSearch({ className }: { className?: string }) {
  return (
    <form action="/app/courses" role="search" className={cx("w-full", className)}>
      <Input
        name="q"
        type="search"
        aria-label="Search courses"
        placeholder="Search courses"
        leadingIcon={RiSearchLine}
        {...touchInput}
        fieldClassName="rounded-full border border-line bg-transparent px-3.5 py-0"
      />
    </form>
  );
}
