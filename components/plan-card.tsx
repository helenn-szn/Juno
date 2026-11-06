// Her plan for a course: how often she studies, what today holds, and the day she finishes.
import Link from "next/link";
import type { Plan } from "@/lib/plan";
import { shortDate } from "@/lib/plan";
import { TIMES, type Profile } from "@/lib/profile";

export function PlanCard({ plan, profile }: { plan: Plan; profile: Profile }) {
  const time = TIMES.find((t) => t.id === profile.time)?.label.toLowerCase();
  return (
    <section aria-labelledby="plan" className="on-dark flex flex-col gap-3 rounded-2xl bg-green p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="plan" className="text-title-3-medium">Your plan</h2>
        <Link href="/app/onboarding" className="flex min-h-11 items-center text-body-2-regular text-radiant underline">
          Change
        </Link>
      </div>
      <p className="text-copy-sm text-text-secondary">
        {plan.sessionsPerWeek} {plan.sessionsPerWeek === 1 ? "session" : "sessions"} a week, about {plan.minutesPerSession} minutes each, {time}.
      </p>
      <p className="rounded-xl bg-dark-green px-4 py-3 text-body-medium">
        {plan.today ? `Today: about ${plan.minutesPerSession} minutes.` : "No session today. Rest well."}{" "}
        <span className="text-radiant">Finish by {shortDate(plan.finish)}.</span>
      </p>
    </section>
  );
}
