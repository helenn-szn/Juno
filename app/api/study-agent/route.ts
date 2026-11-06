// POST /api/study-agent  { messages: UIMessage[], course: string }  →  a streamed reply.
// Signed-in learners only.
import { NextResponse } from "next/server";
import { isAiReady } from "@/lib/ai";
import { findCourse } from "@/lib/courses";
import { currentUser } from "@/lib/session";
import { studyAgent } from "@/lib/study-agent";

// A reply can take a while to stream.
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  if (!isAiReady()) return NextResponse.json({ error: "not-configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.messages) || body.messages.length === 0 || !findCourse(body.course)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  return studyAgent(body.messages.slice(-20), body.course, user.profile);
}
