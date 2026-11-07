"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions";
import { saveMentorPrices } from "@/app/mentors/actions";
import { Button } from "@/components/base/buttons/button";
import { PriceRows } from "@/components/price-rows";
import { courses } from "@/lib/courses";
import { FORMATS, FORMAT_KEYS, priceProblem, type Format, type MentorProfile } from "@/lib/mentors-shared";
import { cx } from "@/utils/cx";

/** Edit prices and the courses a mentor reviews. Same price rules as the application. */
export function MentorPricesForm({ mentor }: { mentor: MentorProfile }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveMentorPrices, {});
  const [picked, setPicked] = useState(mentor.courses);
  const [offer, setOffer] = useState(Object.fromEntries(FORMAT_KEYS.map((f) => [f, mentor.prices[f] !== undefined])) as Record<Format, boolean>);
  const [price, setPrice] = useState(Object.fromEntries(FORMAT_KEYS.map((f) => [f, (mentor.prices[f] ?? Number(FORMATS[f].start)).toFixed(2)])) as Record<Format, string>);
  const problems = Object.fromEntries(FORMAT_KEYS.map((f) => [f, offer[f] ? (priceProblem(f, price[f]) ?? state.errors?.[`price_${f}`]) : undefined]));

  return (
    <form action={action} className="flex max-w-160 flex-col gap-6 p-6 lg:p-7">
      <fieldset className="m-0 flex flex-col gap-2.5 border-none p-0">
        <legend className="mb-2.5 text-body-medium">Courses you review</legend>
        <div className="flex flex-wrap gap-2">
          {courses.map((course) => {
            const on = picked.includes(course.slug);
            return (
              <label key={course.slug} className={cx("inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-body-regular has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-border-focus-ring", on ? "bg-green font-medium text-mint" : "border border-field-border")}>
                <input type="checkbox" name="courses" value={course.slug} checked={on} onChange={() => setPicked((l) => (on ? l.filter((s) => s !== course.slug) : [...l, course.slug]))} className="size-4 accent-radiant outline-none" />
                {course.title}
              </label>
            );
          })}
        </div>
        {state.errors?.courses && <p role="alert" className="text-body-regular text-text-error-primary">{state.errors.courses}</p>}
      </fieldset>
      <div className="flex flex-col gap-2">
        <h2 className="text-body-medium">Your prices</h2>
        <PriceRows offer={offer} setOffer={setOffer} price={price} setPrice={setPrice} problems={problems} />
        {state.errors?.prices && <p role="alert" className="text-body-regular text-text-error-primary">{state.errors.prices}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="h-12 rounded-full px-6 shadow-none">{pending ? "Saving…" : "Save prices"}</Button>
        <span role="status" className="text-body-regular text-text-secondary">{state.values?.saved && !pending ? "Saved. New requests use these prices." : ""}</span>
      </div>
    </form>
  );
}
