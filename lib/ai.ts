// The AI provider, in one file so it can be swapped later.
// Gemini on the free tier, through the Vercel AI SDK. The key stays on the server.
import "server-only";
import { google } from "@ai-sdk/google";

// "-latest" always points at Google's newest Flash model.
export const model = google("gemini-flash-latest");

export const isAiReady = () => Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
