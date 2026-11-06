// Who is signed in. The cookie holds the user's id plus a signature made with
// SESSION_SECRET, so it can't be forged or edited.
import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { findUserById } from "./users";

export const SESSION_COOKIE = "juno_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

function sign(userId: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is missing. Run npm run setup.");
  return crypto.createHmac("sha256", secret).update(userId).digest("base64url");
}

// Returns the user id inside a valid cookie value, or null.
export function readSessionToken(token: string | undefined) {
  const [userId, signature] = token?.split(".") ?? [];
  if (!userId || !signature) return null;
  const expected = Buffer.from(sign(userId));
  const given = Buffer.from(signature);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given) ? userId : null;
}

export async function startSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

// The signed-in learner, or null. Read it inside a <Suspense> boundary.
export async function currentUser() {
  const userId = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  return userId ? ((await findUserById(userId)) ?? null) : null;
}
