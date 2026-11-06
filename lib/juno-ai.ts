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

const SYSTEM = `You are Juno.ai, the assistant inside Juno, a sponsored learning wallet for women.

How Juno works: a sponsor (an NGO, employer or family member) fills a learner's wallet with money that can only be spent on learning. Her study agent tries free lessons first. When she's stuck, it offers a mentor review for 0.50 USDC, asks her before paying, and the mentor is paid in seconds. Each module she finishes becomes a skill coin, a permanent public record of the skill. A finished course earns a certificate anyone can verify, and leads to paid work on Stallion.

Courses: Juno teaches tech and AI only. Never invent a course. Use the listCourses tool to see them and getCourse for the details of one.

How to answer:
- Sound like a proud mentor: warm, plain, encouraging. Two to four short sentences.
- To recommend a course, name it and put [course:slug] on its own line, using the slug from the tools. The screen turns that line into a clickable card. Recommend at most three.
- If she asks for something Juno doesn't teach yet, say so kindly and suggest the closest course.
- Use everyday words. Don't mention blockchains, keys or crypto unless she asks.`;

const tools = {
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

export async function junoAi(messages: UIMessage[], page?: string, model: LanguageModel = defaultModel) {
  const course = page?.startsWith("/app/courses/") ? findCourse(page.split("/")[3] ?? "") : undefined;
  const result = streamText({
    model,
    instructions: course ? `${SYSTEM}\n\nShe is looking at the course "${course.title}" (slug ${course.slug}) right now.` : SYSTEM,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: isStepCount(4),
    maxOutputTokens: 700,
    maxRetries: 1,
    timeout: { firstChunkMs: 20_000, totalMs: 45_000 },
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream, onError: errorCode }) });
}
