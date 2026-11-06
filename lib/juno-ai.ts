// Juno.ai: the assistant on the dashboard. One Claude call per question.
// It answers questions about Juno and the courses, and recommends courses.
// Recommendations can only be real course slugs (enforced by the schema).
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { courses } from "./courses";

const slugs = courses.map((course) => course.slug) as [string, ...string[]];

export const Answer = z.object({
  reply: z.string().describe("Your answer, in a few warm, plain sentences."),
  courses: z.array(z.enum(slugs)).describe("Slugs of courses to show as cards. Empty unless recommending."),
});
export type Answer = z.infer<typeof Answer>;

export const Message = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) });
export type Message = z.infer<typeof Message>;

const SYSTEM = `You are Juno.ai, the assistant inside Juno, a sponsored learning wallet for women.

How Juno works: a sponsor (an NGO, employer or family member) fills a learner's wallet with money that can only be spent on learning. Her study agent tries free lessons first. When she's stuck, it offers a mentor review for a small price, asks her before paying, and the mentor is paid in seconds. Each milestone she finishes becomes a skill coin, a permanent public record of the skill. A finished course earns a certificate anyone can verify, and leads to paid work on Stallion.

The courses (use the slug when recommending):
${JSON.stringify(courses, null, 2)}

How to answer:
- Sound like a proud mentor: warm, plain, encouraging. Short: two to four sentences.
- Only talk about courses in the list above. If she asks for something Juno doesn't teach yet, say so kindly and suggest the closest course.
- Recommend courses when she asks what to learn, or when one clearly fits what she says. Put their slugs in "courses"; leave it empty otherwise.
- Use everyday words. Don't mention blockchains, keys or crypto unless she asks.`;

const client = new Anthropic();

export const isJunoAiReady = () => Boolean(process.env.ANTHROPIC_API_KEY);

export async function askJuno(messages: Message[]): Promise<Answer> {
  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    system: SYSTEM,
    messages,
    output_config: { effort: "low", format: betaZodOutputFormat(Answer) },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    return { reply: "I can't help with that one. Ask me about Juno or the courses?", courses: [] };
  }
  return response.parsed_output;
}
