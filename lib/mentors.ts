// Mentor review requests and everything a mentor does with them.
// A request lives for 24 h waiting for an answer, then 48 h once accepted. Kept in Redis on the live
// site, data/requests.json on your machine. Money moves only when a mentor accepts (see app/mentors/actions.ts).
import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Asset, Keypair, Operation } from "@stellar/stellar-sdk";
import { Redis } from "@upstash/redis";
import { findCourse } from "./courses";
import { FORMAT_KEYS, HOURS, type Format, type ReviewRequest } from "./mentors-shared";
import { notify } from "./notifications";
import { sendUsdc, submitWithMemo, wallet } from "./stellar";
import { findUserById, listMentors, type User } from "./users";

const redis = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? Redis.fromEnv() : null;
const FILE = path.join(process.cwd(), "data", "requests.json");

async function readAll(): Promise<ReviewRequest[]> {
  if (redis) return Object.values((await redis.hgetall<Record<string, ReviewRequest>>("requests")) ?? {});
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function save(request: ReviewRequest) {
  if (redis) return void (await redis.hset("requests", { [request.id]: request }));
  const all = (await readAll()).filter((r) => r.id !== request.id);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify([...all, request], null, 2));
}

export async function findRequest(id: string) {
  const request = (await readAll()).find((r) => r.id === id);
  return request && (await expire(request));
}

// A request nobody answered in 24 h has run out: no money moved. The learner is told once.
async function expire(request: ReviewRequest) {
  if (request.status !== "requested" || new Date(request.expiresAt).getTime() > Date.now()) return request;
  const next = { ...request, status: "expired" as const };
  await save(next);
  const mentor = await findUserById(request.mentorUserId);
  await notify(request.learnerId, {
    kind: "info",
    title: "No answer yet",
    text: `${mentor?.name.split(" ")[0] ?? "The mentor"} didn't answer in time and you weren't charged. Ask your study agent for another mentor.`,
    href: `/app/courses/${request.courseSlug}/learn`,
  });
  return next;
}

async function many(filter: (r: ReviewRequest) => boolean) {
  const found = (await readAll()).filter(filter);
  const fresh = await Promise.all(found.map(expire));
  return fresh.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export const requestsForMentor = (userId: string) => many((r) => r.mentorUserId === userId);
export const requestsForLearner = (userId: string) => many((r) => r.learnerId === userId);
export const allRequests = () => many(() => true);

export async function changeRequest(id: string, change: (r: ReviewRequest) => ReviewRequest) {
  const request = await findRequest(id);
  if (!request) return undefined;
  const next = change(request);
  await save(next);
  return next;
}

/** The mentor who takes a request for this course: the first approved one who is taking requests and offers a format. */
export async function pickMentor(courseSlug: string, skip: string[] = []) {
  const mentor = (await listMentors()).find(
    (u) => u.mentor?.status === "approved" && u.mentor.takingRequests && u.mentor.courses.includes(courseSlug) && !skip.includes(u.id) && u.wallet && FORMAT_KEYS.some((f) => u.mentor!.prices[f]),
  );
  if (!mentor) return undefined;
  // The agent offers the format learners ask for most often: the cheapest she has (written first).
  const format = FORMAT_KEYS.find((f) => mentor.mentor!.prices[f]) as Format;
  return { user: mentor, format, price: mentor.mentor!.prices[format]! };
}

export async function createRequest(learner: User, courseSlug: string, lesson: string, message: string) {
  const course = findCourse(courseSlug);
  if (!course) return undefined;
  // Not the same mentor twice in a row: one who already declined or let it run out is skipped.
  const earlier = (await requestsForLearner(learner.id)).filter((r) => r.courseSlug === courseSlug && (r.status === "declined" || r.status === "expired")).map((r) => r.mentorUserId);
  const pick = await pickMentor(courseSlug, earlier);
  if (!pick) return undefined;
  const request: ReviewRequest = {
    id: crypto.randomBytes(5).toString("base64url"),
    learnerId: learner.id,
    learnerName: learner.name.split(" ")[0],
    mentorUserId: pick.user.id,
    courseSlug,
    courseTitle: course.title,
    lesson,
    format: pick.format,
    price: pick.price,
    message,
    status: "requested",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * HOURS).toISOString(),
  };
  await save(request);
  await notify(pick.user.id, {
    kind: "info",
    title: "New request",
    text: `${request.learnerName} would like ${pick.format === "call" ? "a call" : `${pick.format} feedback`} on ${course.title}. ${request.price.toFixed(2)} USDC.`,
    href: "/app",
  });
  return { request, mentor: pick.user };
}

/** The skill coin: a tiny transaction from the juno wallet whose memo names the review. */
export async function mintSkillCoin(requestId: string) {
  const juno = wallet("juno");
  if (!juno) return undefined;
  const mint = () => submitWithMemo(juno, `skill:${requestId}`, Operation.payment({ destination: juno.publicKey(), asset: Asset.native(), amount: "0.0000001" }));
  // The juno wallet also pays fees for x402 payments; if both land at once, try again.
  return mint().catch(() => mint());
}

/** The 48 h promise was missed: the mentor's wallet sends the money back to the learner. */
export async function refund(request: ReviewRequest) {
  const mentor = await findUserById(request.mentorUserId);
  const learner = await findUserById(request.learnerId);
  if (!mentor?.wallet || !learner?.wallet) throw new Error("A wallet is missing.");
  const refundTx = await sendUsdc(Keypair.fromSecret(mentor.wallet.secret), learner.wallet.publicKey, request.price);
  await changeRequest(request.id, (r) => ({ ...r, status: "refunded", refundTx }));
  await notify(request.learnerId, { kind: "paid", title: "Your money is back", text: `${request.price.toFixed(2)} USDC was returned because the review didn't arrive in time.`, tx: refundTx, href: "/app/wallet" });
  await notify(mentor.id, { kind: "info", title: "A review was refunded", text: `${request.learnerName}'s ${request.price.toFixed(2)} USDC went back to her because it wasn't delivered in 48 hours.`, tx: refundTx });
  return refundTx;
}

/** Numbers for the mentor's tiles and right column. */
export function mentorStats(requests: ReviewRequest[], now: number) {
  const paid = requests.filter((r) => r.payTx && r.status !== "refunded");
  const month = new Date(now).toISOString().slice(0, 7);
  const done = requests.filter((r) => r.status === "delivered");
  const replies = requests.filter((r) => r.acceptedAt).map((r) => new Date(r.acceptedAt!).getTime() - new Date(r.createdAt).getTime());
  const avg = replies.length ? replies.reduce((a, b) => a + b, 0) / replies.length : undefined;
  return {
    earnedThisMonth: paid.filter((r) => r.acceptedAt?.startsWith(month)).reduce((sum, r) => sum + r.price, 0),
    done: done.length,
    women: new Set(done.map((r) => r.learnerId)).size,
    averageReply: avg === undefined ? "No replies yet" : avg < HOURS ? `${Math.max(1, Math.round(avg / 60_000))} min` : `${Math.round(avg / HOURS)} h`,
  };
}
