// POST /api/juno-ai  { messages: [{ role, content }] }  →  { reply, courses }
// Signed-in learners only. `courses` holds course slugs to show as cards.
import { NextResponse } from "next/server";
import { z } from "zod";
import { Message, askJuno, isJunoAiReady } from "@/lib/juno-ai";
import { currentUser } from "@/lib/session";

const Body = z.object({ messages: z.array(Message).min(1).max(40) });

export async function POST(request: Request) {
  if (!(await currentUser())) {
    return NextResponse.json({ error: "signed-out" }, { status: 401 });
  }
  if (!isJunoAiReady()) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success || body.data.messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  try {
    return NextResponse.json(await askJuno(body.data.messages));
  } catch (error) {
    console.error("Juno.ai failed:", error);
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
