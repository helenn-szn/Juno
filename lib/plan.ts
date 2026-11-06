// Her study plan for a course, from her schedule and what she already knows.
// Pure maths, no server code: the form previews it and the course pages show it.
import { requiredLessons, type Course } from "./courses";
import { DAYS, type Profile } from "./profile";

// People who already know the basics move through lessons faster.
const PACE = { new: 1, some: 0.85, experienced: 0.7 } as const;

export type Plan = {
  sessionsPerWeek: number;
  minutesPerSession: number;
  weeks: number;
  finish: Date;
  /** When she should finish each module still ahead of her, in order. */
  due: Date[];
  /** Minutes planned for today if today is a study day. */
  today: number | null;
};

const dayId = (date: Date) => DAYS[(date.getDay() + 6) % 7].id;

/** Minutes in one study session, rounded to 5. */
export const sessionMinutes = (hoursPerWeek: number, sessions: number) => Math.max(15, Math.round((hoursPerWeek * 60) / sessions / 5) * 5);

export function buildPlan(course: Course, profile: Profile, modulesDone = 0, from = new Date()): Plan {
  const pace = PACE[profile.experience];
  const sessionsPerWeek = profile.days.length;
  const minutesPerSession = sessionMinutes(profile.hoursPerWeek, sessionsPerWeek);

  // The study days ahead, starting today.
  const days: Date[] = [];
  for (let offset = 0; days.length < 400 && offset < 800; offset++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
    if (profile.days.includes(dayId(day))) days.push(day);
  }

  let total = 0;
  const due = course.modules.slice(modulesDone).map((unit) => {
    const minutes = requiredLessons(unit).reduce((sum, index) => sum + (unit.lessons[index].minutes ?? 0), 0);
    total += minutes * pace;
    return days[Math.max(0, Math.ceil(total / minutesPerSession) - 1)];
  });

  return {
    sessionsPerWeek,
    minutesPerSession,
    weeks: Math.max(1, Math.ceil(total / (profile.hoursPerWeek * 60))),
    finish: due.at(-1) ?? from,
    due,
    today: days[0]?.getTime() === new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime() ? minutesPerSession : null,
  };
}

export const shortDate = (date: Date) => date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
