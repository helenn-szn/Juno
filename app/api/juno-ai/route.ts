// POST /api/juno-ai  { messages: UIMessage[], page?: string }  →  a streamed reply.
// Signed-in learners only.
import { NextResponse } from "next/server";
import { isAiReady } from "@/lib/ai";
import { junoAi } from "@/lib/juno-ai";
import { currentUser } from "@/lib/session";

export async function POST(request: Request) {
  if (!(await currentUser())) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  if (!isAiReady()) return NextResponse.json({ error: "not-configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  // Only the recent conversation is sent to the model.
  return junoAi(body.messages.slice(-20), typeof body.page === "string" ? body.page : undefined);
}
