// Juno.ai: the assistant on the dashboard. One Gemini call per question.
// It answers questions about Juno and the courses, and recommends courses.
// It replies as JSON, and only real course slugs make it through.
import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { courses } from "./courses";

// "-latest" always points at Google's current Flash model.
const MODEL = "gemini-flash-latest";

export type Answer = { reply: string; courses: string[] };

export const Message = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) });
export type Message = z.infer<typeof Message>;

const slugs = courses.map((course) => course.slug);

const answerSchema = {
  type: "object",
  properties: {
    reply: { type: "string", description: "Your answer, in a few warm, plain sentences." },
    courses: {
      type: "array",
      items: { type: "string", enum: slugs },
      description: "Slugs of courses to show as cards. Empty unless recommending.",
    },
  },
  required: ["reply", "courses"],
};

const Reply = z.object({ reply: z.string().min(1), courses: z.array(z.string()) });

const SYSTEM = `You are Juno.ai, the assistant inside Juno, a sponsored learning wallet for women.

How Juno works: a sponsor (an NGO, employer or family member) fills a learner's wallet with money that can only be spent on learning. Her study agent tries free lessons first. When she's stuck, it offers a mentor review for a small price, asks her before paying, and the mentor is paid in seconds. Each milestone she finishes becomes a skill coin, a permanent public record of the skill. A finished course earns a certificate anyone can verify, and leads to paid work on Stallion.

The courses (use the slug when recommending):
${JSON.stringify(courses, null, 2)}

How to answer:
- Sound like a proud mentor: warm, plain, encouraging. Short: two to four sentences.
- Only talk about courses in the list above. If she asks for something Juno doesn't teach yet, say so kindly and suggest the closest course.
- Recommend courses when she asks what to learn, or when one clearly fits what she says. Put their slugs in "courses"; leave it empty otherwise.
- Use everyday words. Don't mention blockchains, keys or crypto unless she asks.`;

export const isJunoAiReady = () => Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function askJuno(messages: Message[]): Promise<Answer> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: messages.map(({ role, content }) => ({
      role: role === "assistant" ? "model" : "user",
      parts: [{ text: content }],
    })),
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: "application/json",
      responseJsonSchema: answerSchema,
    },
  });

  // No text means Gemini declined to answer (its safety filters).
  if (!response.text) {
    return { reply: "I can't help with that one. Ask me about Juno or the courses?", courses: [] };
  }
  const answer = Reply.parse(JSON.parse(response.text));
  return { reply: answer.reply, courses: answer.courses.filter((slug) => slugs.includes(slug)) };
}
