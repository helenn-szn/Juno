// The AI provider, in one file so it can be swapped later.
// Gemini on the free tier, through the Vercel AI SDK. The key stays on the server.
import "server-only";
import { google } from "@ai-sdk/google";

// The newest Flash model that answers reliably. Google's newer ones (3.7, 3.8)
// and the "gemini-flash-latest" alias were hanging when this was tested, and
// older ones (2.5) are closed to new keys. To move up, change this one line.
export const model = google("gemini-3.6-flash");

export const isAiReady = () => Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
