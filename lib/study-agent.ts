// The study agent: her coach inside a course. It tries free help first. When she
// is still stuck it offers a paid mentor review, but it never pays: the pay
// button on the screen does, after she says yes.
import "server-only";
import { convertToModelMessages, createUIMessageStreamResponse, isStepCount, streamText, tool, toUIMessageStream } from "ai";
import type { LanguageModel, UIMessage } from "ai";
import { z } from "zod";
import { model as defaultModel } from "./ai";
import { MENTOR_REVIEW_PRICE } from "./constants";
import { pickMentor } from "./mentors";
import { errorCode } from "./juno-ai";
import { findCourse } from "./courses";
import { describeProfile, type Profile } from "./profile";
import { usdcBalanceOrZero, wallet } from "./stellar";

const SYSTEM = `You are the study agent inside Juno, a learning wallet for women. You coach one learner through the course she is taking.

How you help:
- Always try free help first. Call suggestFreeResource with the exact topic she is stuck on, then explain in one or two plain sentences what to watch for.
- If she says she is still stuck after a free resource, or asks for a person, call offerPaidHelp. A mentor review costs what the mentor charges (about ${MENTOR_REVIEW_PRICE} USDC); the tool tells you the price, and it is paid from her learning wallet only after the mentor accepts.
- You cannot pay. Never say you paid. The screen shows her a Book review button and she decides.
- Call checkBudget only if she asks about her money, or before you offer paid help if she says her wallet is low.
- Sound like a proud mentor: warm, plain, encouraging. Two to three short sentences. Everyday words, no jargon about blockchains or keys.
- Stay on her course. If she asks for something unrelated, kindly bring her back.`;

const toolsFor = (courseSlug: string, walletAddress?: string) => ({
  suggestFreeResource: tool({
    description: "Find a free video for the exact thing she is stuck on. Returns a link to watch it.",
    inputSchema: z.object({ topic: z.string().describe("What she is stuck on, in a few words, e.g. 'giving an AI agent a tool'") }),
    execute: async ({ topic }) => ({
      title: topic,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} tutorial for beginners`)}`,
    }),
  }),
  offerPaidHelp: tool({
    description: "Offer a paid mentor review. Use only after a free resource did not help or she asks for a mentor.",
    inputSchema: z.object({ reason: z.string().describe("One short sentence: what the mentor would review for her") }),
    execute: async ({ reason }) => {
      // The first approved mentor for her course, at that mentor's own price.
      const pick = await pickMentor(courseSlug);
      return { reason, price: pick ? pick.price.toFixed(2) : MENTOR_REVIEW_PRICE, mentor: pick?.user.name.split(" ")[0], currency: "USDC" };
    },
  }),
  checkBudget: tool({
    description: "How much USDC is in her learning wallet right now.",
    inputSchema: z.object({}),
    execute: async () => {
      // Her own wallet if it holds some; otherwise the shared demo wallet that pays for her.
      const own = walletAddress ? await usdcBalanceOrZero(walletAddress) : 0;
      const demo = wallet("learner");
      return { balance: own > 0 ? own : demo ? await usdcBalanceOrZero(demo.publicKey()) : 0, currency: "USDC" };
    },
  }),
});

export async function studyAgent(messages: UIMessage[], courseSlug: string, profile?: Profile, walletAddress?: string, model: LanguageModel = defaultModel) {
  const course = findCourse(courseSlug);
  const result = streamText({
    model,
    instructions: [
      SYSTEM,
      course ? `Her course: "${course.title}". Its modules: ${course.modules.map((unit, index) => `${index + 1}. ${unit.title}`).join("; ")}.` : "",
      profile ? `What she told us about herself: ${describeProfile(profile)} Explain at her level, use her background for examples, and keep it short if her time is short.` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    messages: await convertToModelMessages(messages),
    tools: toolsFor(courseSlug, walletAddress),
    stopWhen: isStepCount(4),
    maxOutputTokens: 600,
    maxRetries: 1,
    timeout: { firstChunkMs: 20_000, totalMs: 45_000 },
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream, onError: errorCode }) });
}
