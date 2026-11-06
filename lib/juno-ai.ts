// Juno.ai: the assistant in the corner of every app screen. It answers
// questions about Juno and the courses, and recommends real courses only.
// It reads the course file through two tools, and marks a recommendation as
// [course:slug] so the screen can show it as a card.
import "server-only";
import { convertToModelMessages, createUIMessageStreamResponse, isStepCount, streamText, tool, toUIMessageStream } from "ai";
import type { LanguageModel, UIMessage } from "ai";
import { z } from "zod";
import { model as defaultModel } from "./ai";
import { courses, findCourse, moduleCount } from "./courses";
import { describeProfile, profileSchema, type Profile } from "./profile";
import { updateUser } from "./users";

const SYSTEM = `You are Juno.ai, the assistant inside Juno, a sponsored learning wallet for women.

How Juno works: a sponsor (an NGO, employer or family member) fills a learner's wallet with money that can only be spent on learning. Her study agent tries free lessons first. When she's stuck, it offers a mentor review for 0.50 USDC, asks her before paying, and the mentor is paid in seconds. Each module she finishes becomes a skill coin, a permanent public record of the skill. A finished course earns a certificate anyone can verify, and leads to paid work on Stallion.

Courses: Juno teaches tech and AI only. Never invent a course. Use the listCourses tool to see them and getCourse for the details of one.

How to answer:
- Sound like a proud mentor: warm, plain, encouraging. Two to four short sentences.
- To recommend a course, name it and put [course:slug] on its own line, using the slug from the tools. The screen turns that line into a clickable card. Recommend at most three.
- If she asks for something Juno doesn't teach yet, say so kindly and suggest the closest course.
- If she attaches a photo, look at it and help with what it shows, kindly, in the same short style.
- Use everyday words. Don't mention blockchains, keys or crypto unless she asks.`;

const courseTools = {
  listCourses: tool({
    description: "List every course Juno teaches, with slug, level, number of modules and a short summary.",
    inputSchema: z.object({}),
    execute: async () =>
      courses.map(({ slug, title, level, topic, summary, modules }) => ({
        slug,
        title,
        level,
        topic,
        modules: modules.length,
        summary,
      })),
  }),
  getCourse: tool({
    description: "Get the full details of one course: its summary, level and the titles of its modules.",
    inputSchema: z.object({ slug: z.string().describe("The course slug from listCourses") }),
    execute: async ({ slug }) => {
      const course = findCourse(slug);
      if (!course) return { error: "No course has that slug. Call listCourses." };
      return {
        slug: course.slug,
        title: course.title,
        level: course.level,
        length: moduleCount(course),
        summary: course.summary,
        modules: course.modules.map((module) => module.title),
      };
    },
  }),
};

// The screen shows "busy" as a friendly message; anything else as a general one.
// Busy means Google is rate-limiting us, is overloaded (503), or took too long.
export const errorCode = (error: unknown) => {
  const { statusCode, name } = (error ?? {}) as { statusCode?: number; name?: string };
  return statusCode === 429 || statusCode === 503 || /timeout|abort/i.test(name ?? "") ? "busy" : "failed";
};

// Saving what she tells us about herself. Only ever for the signed-in learner.
const profileTools = (userId: string) => ({
  saveProfile: tool({
    description: "Save what she told you about herself: how much she knows, her goal, and when she can study. Call it once you have every answer, or again if she wants to change them.",
    inputSchema: profileSchema,
    execute: async (profile) => {
      await updateUser(userId, (user) => ({ ...user, profile }));
      return { saved: true };
    },
  }),
});

const ONBOARDING = `She has not told us about herself yet, and every course is tailored to her answers. Warmly help her set up her learning plan right here in the chat, one short question at a time, offering the choices:
1. How much she knows about tech: new, some, or already works with tech.
2. What she does now or has studied (a few words).
3. Her goal: a tech job, growing in her work, building a business, or learning for herself.
4. Hours a week she can study: 2, 4, 6 or 10.
5. Which days of the week.
6. When she studies best: mornings, afternoons, evenings, or whenever she can.
When you have all six, call saveProfile once. Then say in one sentence that her plan is saved and recommend the best course for her with [course:slug]. Do not ask for anything else, and never ask for an email or a password.`;

export async function junoAi(
  messages: UIMessage[],
  page?: string,
  user?: { id: string; profile?: Profile },
  model: LanguageModel = defaultModel,
) {
  const course = page?.startsWith("/app/courses/") ? findCourse(page.split("/")[3] ?? "") : undefined;
  const result = streamText({
    model,
    instructions: [
      SYSTEM,
      course ? `She is looking at the course "${course.title}" (slug ${course.slug}) right now.` : "",
      user?.profile
        ? `What she told us about herself: ${describeProfile(user.profile)} Tailor what you say and recommend to this. If she wants to change her answers, ask what changes and call saveProfile again with all of them.`
        : user
          ? ONBOARDING
          : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    messages: await convertToModelMessages(messages),
    tools: { ...courseTools, ...(user ? profileTools(user.id) : {}) },
    stopWhen: isStepCount(4),
    maxOutputTokens: 700,
    maxRetries: 1,
    timeout: { firstChunkMs: 20_000, totalMs: 45_000 },
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream, onError: errorCode }) });
}
