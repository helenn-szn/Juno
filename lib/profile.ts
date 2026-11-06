// What a learner tells us before her first course: how much she knows, what she wants,
// and when she can study. Courses, the plan and both AI helpers are tailored to it.
// Plain values and no server code, so the form, the server and the AI tools share it.
import { z } from "zod";
import type { Course } from "./courses";

export const EXPERIENCE = [
  { id: "new", label: "I'm new to tech", hint: "Start from the very beginning" },
  { id: "some", label: "I know a little", hint: "I've tried a few things" },
  { id: "experienced", label: "I work with tech", hint: "I want to go deeper, faster" },
] as const;

export const GOALS = [
  { id: "job", label: "Get a tech job" },
  { id: "grow", label: "Grow in my work" },
  { id: "business", label: "Build my business" },
  { id: "curious", label: "Learn for myself" },
] as const;

export const HOURS = [
  { value: 2, label: "About 2 hours" },
  { value: 4, label: "About 4 hours" },
  { value: 6, label: "About 6 hours" },
  { value: 10, label: "10 hours or more" },
] as const;

export const DAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

export const TIMES = [
  { id: "morning", label: "Mornings" },
  { id: "afternoon", label: "Afternoons" },
  { id: "evening", label: "Evenings" },
  { id: "flexible", label: "Whenever I can" },
] as const;

const ids = <T extends readonly { id: string }[]>(list: T) => list.map((item) => item.id) as [T[number]["id"], ...T[number]["id"][]];

export const profileSchema = z.object({
  experience: z.enum(ids(EXPERIENCE)).describe("How much she already knows about tech"),
  goal: z.enum(ids(GOALS)).describe("What she wants from learning"),
  background: z.string().trim().max(120).default("").describe("What she does now or has studied, in her own words"),
  hoursPerWeek: z.union([z.literal(2), z.literal(4), z.literal(6), z.literal(10)]).describe("Hours a week she can study"),
  days: z.array(z.enum(ids(DAYS))).min(1).max(7).describe("The days she can study"),
  time: z.enum(ids(TIMES)).describe("When in the day she studies best"),
});

export type Profile = z.infer<typeof profileSchema>;

const label = <T extends readonly { id: string; label: string }[]>(list: T, id: string) => list.find((item) => item.id === id)?.label ?? id;

/** Her answers as a sentence, for the AI helpers. */
export function describeProfile(profile: Profile) {
  return [
    `Experience: ${label(EXPERIENCE, profile.experience)}.`,
    `Goal: ${label(GOALS, profile.goal)}.`,
    profile.background ? `Background: ${profile.background}.` : "",
    `Studies about ${profile.hoursPerWeek} hours a week, on ${profile.days.join(", ")}, ${label(TIMES, profile.time).toLowerCase()}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** How well a course suits her: higher is better. Used to order what we recommend. */
export function fitScore(course: Course, profile: Profile) {
  let score = 0;
  if (profile.experience === "new") score += course.level === "Beginner" ? 2 : -1;
  if (profile.experience === "some") score += course.level === "Beginner" ? 1 : 0.5;
  if (profile.experience === "experienced") score += course.level === "Intermediate" ? 2 : 0;
  const words = `${profile.background} ${profile.goal}`.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
  const text = `${course.title} ${course.topic} ${course.summary}`.toLowerCase();
  score += words.filter((word) => text.includes(word)).length;
  if (profile.goal === "job" && ["Development", "Data"].includes(course.topic)) score += 1;
  if (profile.goal === "business" && course.topic === "AI") score += 1;
  return score;
}
