"use client";

import { useActionState, useState } from "react";
import { RiArrowLeftLine } from "@remixicon/react";
import { saveProfile, type FormState } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ProgressLine } from "@/components/progress";
import { touchInput } from "@/components/touch-input";
import { findCourse } from "@/lib/courses";
import { buildPlan, sessionMinutes, shortDate } from "@/lib/plan";
import { DAYS, EXPERIENCE, GOALS, HOURS, TIMES, profileSchema, type Profile } from "@/lib/profile";
import { cx } from "@/utils/cx";

const STEPS = ["About you", "Your goal", "Your time", "Your plan"] as const;

/** A choice she can tap. `selected` makes it a filled button. */
function Choice({ selected, onClick, children, hint }: { selected: boolean; onClick: () => void; children: string; hint?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cx(
        "flex min-h-14 flex-col items-start justify-center rounded-2xl border px-4 py-2.5 text-start outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
        selected ? "border-green bg-green text-mint" : "border-line hover:border-text-tertiary",
      )}
    >
      <span className="text-body-medium">{children}</span>
      {hint && <span className={cx("text-body-2-regular", selected ? "text-text-secondary" : "text-text-tertiary")}>{hint}</span>}
    </button>
  );
}

function Pill({ selected, onClick, children, multi = false }: { selected: boolean; onClick: () => void; children: string; multi?: boolean }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cx(
        "min-h-11 rounded-full border px-4 text-body-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
        selected ? "border-green bg-green text-mint" : "border-line hover:border-text-tertiary",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Four short steps: what she knows, what she wants, when she can study, and the plan
 * that comes from it. `next` is the course she was about to start.
 */
export function OnboardingForm({ next, initial }: { next?: string; initial?: Profile }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile.bind(null, next), {});
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<string>(initial?.experience ?? "");
  const [goal, setGoal] = useState<string>(initial?.goal ?? "");
  const [background, setBackground] = useState(initial?.background ?? "");
  const [hours, setHours] = useState<number>(initial?.hoursPerWeek ?? 0);
  const [days, setDays] = useState<string[]>(initial?.days ?? []);
  const [time, setTime] = useState<string>(initial?.time ?? "");

  const answers = profileSchema.safeParse({ experience, goal, background, hoursPerWeek: hours, days, time });
  const course = next ? findCourse(next) : undefined;
  const plan = answers.success && course ? buildPlan(course, answers.data) : undefined;
  const ready = [Boolean(experience), Boolean(goal), Boolean(hours && days.length && time), answers.success][step];

  return (
    <form action={action} className="flex max-w-120 flex-col gap-6 p-6 lg:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-body-2-regular text-text-secondary">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              aria-label="Back"
              className="-ms-2 flex size-11 items-center justify-center rounded-full outline-none hover:bg-mint focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              <RiArrowLeftLine className="size-5" aria-hidden />
            </button>
          )}
          <span>
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
        </div>
        <ProgressLine percent={((step + 1) / STEPS.length) * 100} size="sm" label="Setup progress" />
      </div>

      {step === 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-title-2-medium tracking-[-0.02em]">How much do you know about tech?</legend>
          <div role="radiogroup" aria-label="Experience" className="flex flex-col gap-2.5">
            {EXPERIENCE.map((option) => (
              <Choice key={option.id} selected={experience === option.id} hint={option.hint} onClick={() => setExperience(option.id)}>
                {option.label}
              </Choice>
            ))}
          </div>
          <Input
            aria-label="What do you do now, or what have you studied?"
            placeholder="What do you do now? (optional)"
            value={background}
            onChange={setBackground}
            maxLength={120}
            autoComplete="off"
            {...touchInput}
          />
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-title-2-medium tracking-[-0.02em]">What do you want from learning?</legend>
          <div role="radiogroup" aria-label="Goal" className="flex flex-col gap-2.5">
            {GOALS.map((option) => (
              <Choice key={option.id} selected={goal === option.id} onClick={() => setGoal(option.id)}>
                {option.label}
              </Choice>
            ))}
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-title-2-medium tracking-[-0.02em]">How many hours a week can you study?</legend>
            <div role="radiogroup" aria-label="Hours a week" className="flex flex-wrap gap-2">
              {HOURS.map((option) => (
                <Pill key={option.value} selected={hours === option.value} onClick={() => setHours(option.value)}>
                  {option.label}
                </Pill>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-title-3-medium">Which days?</legend>
            <div role="group" aria-label="Days" className="flex flex-wrap gap-2">
              {DAYS.map((option) => (
                <Pill
                  key={option.id}
                  multi
                  selected={days.includes(option.id)}
                  onClick={() => setDays(days.includes(option.id) ? days.filter((day) => day !== option.id) : [...days, option.id])}
                >
                  {option.label}
                </Pill>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-title-3-medium">When do you study best?</legend>
            <div role="radiogroup" aria-label="Time of day" className="flex flex-wrap gap-2">
              {TIMES.map((option) => (
                <Pill key={option.id} selected={time === option.id} onClick={() => setTime(option.id)}>
                  {option.label}
                </Pill>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === 3 && answers.success && (
        <section className="flex flex-col gap-4" aria-live="polite">
          <h2 className="text-title-2-medium tracking-[-0.02em]">Here&apos;s your plan</h2>
          <p className="text-copy text-text-secondary">
            {days.length} {days.length === 1 ? "session" : "sessions"} a week, about {sessionMinutes(hours, days.length)} minutes each, {TIMES.find((t) => t.id === time)?.label.toLowerCase()}.
          </p>
          {plan && course ? (
            <div className="on-dark flex flex-col gap-1 rounded-2xl bg-green p-5">
              <span className="text-body-2-regular text-text-tertiary">{course.title}</span>
              <span className="text-title-2-medium text-radiant">Finish by {shortDate(plan.finish)}</span>
              <span className="text-body-regular text-text-secondary">About {plan.weeks} {plan.weeks === 1 ? "week" : "weeks"} at this pace</span>
            </div>
          ) : (
            <p className="text-copy text-text-secondary">When you pick a course, we&apos;ll show you the day you&apos;d finish it.</p>
          )}
          <p className="text-body-regular text-text-secondary">You can change this any time in Settings, or by chatting with Juno.ai.</p>
        </section>
      )}

      {answers.success && (
        <>
          <input type="hidden" name="experience" value={experience} />
          <input type="hidden" name="goal" value={goal} />
          <input type="hidden" name="background" value={background} />
          <input type="hidden" name="hoursPerWeek" value={hours} />
          <input type="hidden" name="time" value={time} />
          {days.map((day) => (
            <input key={day} type="hidden" name="days" value={day} />
          ))}
        </>
      )}
      {state.errors?.form && <p role="alert" className="text-body-regular text-text-error-primary">{state.errors.form}</p>}

      {step < STEPS.length - 1 ? (
        <Button key="next" type="button" disabled={!ready} onClick={() => setStep(step + 1)} className="h-12 rounded-full shadow-none">
          Next
        </Button>
      ) : (
        <Button key="save" type="submit" disabled={!ready || pending} className="h-12 rounded-full shadow-none">
          {pending ? "Saving…" : course ? "Start my course" : "Save my plan"}
        </Button>
      )}
    </form>
  );
}
