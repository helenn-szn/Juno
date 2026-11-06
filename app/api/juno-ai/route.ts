// POST /api/juno-ai  { messages: UIMessage[], page?: string }  →  a streamed reply.
// Signed-in learners only.
import { NextResponse } from "next/server";
import { isAiReady } from "@/lib/ai";
import { isOurImage } from "@/lib/uploads";
import { junoAi } from "@/lib/juno-ai";
import { currentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  if (!isAiReady()) return NextResponse.json({ error: "not-configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  // Only the recent conversation is sent to the model, and only photos this app saved.
  // A local /uploads/ link is made absolute so the server can fetch it.
  const origin = new URL(request.url).origin;
  const messages = body.messages.slice(-20).map((message: { parts?: { type: string; url?: string }[] }) => ({
    ...message,
    parts: (message.parts ?? []).flatMap((part) => {
      if (part.type !== "file") return [part];
      return part.url && isOurImage(part.url) ? [{ ...part, url: new URL(part.url, origin).href }] : [];
    }),
  }));
  return junoAi(messages, typeof body.page === "string" ? body.page : undefined, user);
}
