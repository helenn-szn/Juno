// Sponsoring: who a sponsor backs, the seats they fund, and every payment that follows.
//  - An invite is for one woman: a link the sponsor shares.
//  - A seat pool is for any woman who enrols in a course; the first to start it takes a seat.
//  - Either way the sponsor's budget moves from the sponsor's wallet into the learner's
//    wallet, on Stellar, when she joins. What she doesn't spend stays with her.
// Kept in Redis on the live site, data/sponsoring.json on your machine.
import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Keypair } from "@stellar/stellar-sdk";
import { Redis } from "@upstash/redis";
import { certificatesFor } from "./certificates";
import { findCourse } from "./courses";
import { sendUsdc, usdcBalanceOrZero } from "./stellar";
import { findUserById, setUpWallet } from "./users";

export type Sponsorship = {
  id: string;
  sponsorId: string;
  kind: "invite" | "seat" | "direct"; // direct: sent to a learner by her Juno ID
  courseSlug?: string; // a direct sponsorship follows whatever course she is on
  budget: number; // USDC, moved to the learner's wallet when she joins
  label?: string; // who the invite is for, as the sponsor wrote it
  token?: string; // the invite link
  poolId?: string;
  learnerId?: string;
  createdAt: string;
};

export type SeatPool = { id: string; sponsorId: string; courseSlug: string; seats: number; budget: number; createdAt: string };

export type Payment = {
  id: string;
  sponsorId: string;
  learnerId?: string;
  kind: "topup" | "budget" | "review";
  amount: number;
  tx: string;
  at: string;
};

type Doc = { sponsorships: Sponsorship[]; pools: SeatPool[]; payments: Payment[] };

const redis = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? Redis.fromEnv() : null;
const FILE = path.join(process.cwd(), "data", "sponsoring.json");
const EMPTY: Doc = { sponsorships: [], pools: [], payments: [] };

async function load(): Promise<Doc> {
  if (redis) return { ...EMPTY, ...((await redis.get<Doc>("sponsoring")) ?? {}) };
  try {
    return { ...EMPTY, ...JSON.parse(await fs.readFile(FILE, "utf8")) };
  } catch {
    return EMPTY;
  }
}

async function change(update: (doc: Doc) => void) {
  const doc = await load();
  update(doc);
  if (redis) return void (await redis.set("sponsoring", doc));
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(doc, null, 2));
}

const id = () => crypto.randomBytes(9).toString("base64url");
const now = () => new Date().toISOString();

// --- Setting things up -------------------------------------------------------------

export async function createInvite(sponsorId: string, label: string, courseSlug: string, budget: number) {
  const invite: Sponsorship = { id: id(), sponsorId, kind: "invite", courseSlug, budget, label, token: id(), createdAt: now() };
  await change((doc) => void doc.sponsorships.push(invite));
  return invite;
}

export async function addSeats(sponsorId: string, courseSlug: string, seats: number, budget: number) {
  await change((doc) => void doc.pools.push({ id: id(), sponsorId, courseSlug, seats, budget, createdAt: now() }));
}

export async function recordTopUp(sponsorId: string, amount: number, tx: string) {
  await change((doc) => void doc.payments.push({ id: id(), sponsorId, kind: "topup", amount, tx, at: now() }));
}

export async function findInvite(token: string) {
  return (await load()).sponsorships.find((s) => s.token === token);
}

/** Money a sponsor has promised but not yet sent: open invites, free seats, and learners waiting to be funded. */
export async function committedBudget(sponsorId: string) {
  const doc = await load();
  const unsent = (s: Sponsorship) => !doc.payments.some((p) => p.kind === "budget" && p.learnerId === s.learnerId && s.learnerId);
  const invites = doc.sponsorships.filter((s) => s.sponsorId === sponsorId && s.kind === "invite" && unsent(s));
  const seats = doc.pools
    .filter((pool) => pool.sponsorId === sponsorId)
    .reduce((sum, pool) => sum + pool.budget * (pool.seats - doc.sponsorships.filter((s) => s.poolId === pool.id).length), 0);
  const joinedSeats = doc.sponsorships.filter((s) => s.sponsorId === sponsorId && s.kind === "seat" && unsent(s));
  return [...invites, ...joinedSeats].reduce((sum, s) => sum + s.budget, 0) + seats;
}

// --- When a learner joins ----------------------------------------------------------

/** A new learner signed up through an invite link: she is now that sponsor's learner. */
export async function linkInvite(token: string, learnerId: string) {
  let linked = false;
  await change((doc) => {
    const invite = doc.sponsorships.find((s) => s.token === token && !s.learnerId);
    if (invite) {
      invite.learnerId = learnerId;
      linked = true;
    }
  });
  return linked;
}

/** She starts a course that has free sponsored seats: the first free seat is hers. */
export async function claimSeat(learnerId: string, courseSlug: string) {
  await change((doc) => {
    if (doc.sponsorships.some((s) => s.learnerId === learnerId && s.courseSlug === courseSlug)) return;
    const pool = doc.pools.find((p) => p.courseSlug === courseSlug && doc.sponsorships.filter((s) => s.poolId === p.id).length < p.seats);
    if (!pool) return;
    doc.sponsorships.push({ id: id(), sponsorId: pool.sponsorId, kind: "seat", courseSlug, budget: pool.budget, poolId: pool.id, learnerId, createdAt: now() });
  });
}

/** Sends the budget of every sponsorship this learner has that hasn't been sent yet. */
const funding = new Set<string>(); // learners being funded right now, so one budget is never sent twice

export async function fundPending(learnerId: string) {
  if (funding.has(learnerId)) return;
  funding.add(learnerId);
  try {
    await fund(learnerId);
  } finally {
    funding.delete(learnerId);
  }
}

async function fund(learnerId: string) {
  const doc = await load();
  if (!doc.sponsorships.some((s) => s.learnerId === learnerId && !doc.payments.some((p) => p.id.startsWith(`${s.id}-`)))) return; // nothing waiting
  await setUpWallet(learnerId); // her wallet must be open on Stellar, with permission to hold USDC
  const learner = await findUserById(learnerId);
  if (!learner?.wallet) return;
  for (const s of doc.sponsorships.filter((x) => x.learnerId === learnerId)) {
    if (doc.payments.some((p) => p.id.startsWith(`${s.id}-`))) continue; // already sent
    const sponsor = await findUserById(s.sponsorId);
    if (!sponsor?.wallet) continue;
    try {
      const tx = await sendUsdc(Keypair.fromSecret(sponsor.wallet.secret), learner.wallet.publicKey, s.budget);
      await change((d) => void d.payments.push({ id: `${s.id}-${id()}`, sponsorId: s.sponsorId, learnerId, kind: "budget", amount: s.budget, tx, at: now() }));
    } catch (error) {
      console.error("Could not send a sponsored budget:", error);
    }
  }
}

/** The sponsor sent USDC straight to a learner, found by her Juno ID. She becomes (or stays) one of the sponsor's learners. */
export async function recordDirect(sponsorId: string, learnerId: string, amount: number, tx: string) {
  await change((doc) => {
    let s = doc.sponsorships.find((x) => x.sponsorId === sponsorId && x.learnerId === learnerId && x.kind === "direct");
    if (!s) {
      s = { id: id(), sponsorId, kind: "direct", budget: 0, learnerId, createdAt: now() };
      doc.sponsorships.push(s);
    }
    s.budget = +(s.budget + amount).toFixed(7);
    doc.payments.push({ id: `${s.id}-${id()}`, sponsorId, learnerId, kind: "budget", amount, tx, at: now() });
  });
}

/** A sponsored learner paid for a mentor review from her own wallet. */
export async function recordReview(learnerId: string, courseSlug: string, amount: number, tx: string) {
  await change((doc) => {
    const s = doc.sponsorships.find((x) => x.learnerId === learnerId && x.courseSlug === courseSlug) ?? doc.sponsorships.find((x) => x.learnerId === learnerId);
    if (s) doc.payments.push({ id: id(), sponsorId: s.sponsorId, learnerId, kind: "review", amount, tx, at: now() });
  });
}

/** Does this learner have a sponsor who has already sent her budget? */
export async function isFunded(learnerId: string) {
  return (await load()).payments.some((p) => p.kind === "budget" && p.learnerId === learnerId);
}

// --- The dashboard -----------------------------------------------------------------

export type LearnerRow = {
  id: string;
  name: string;
  courseTitle: string;
  how: "invited" | "seat" | "sent by ID";
  status: "pending" | "funding" | "learning" | "certified";
  percent: number;
  used: number;
  budget: number;
  token?: string;
};

export type SponsorSummary = {
  balance: number;
  address?: string;
  totalGiven: number;
  coins: number;
  certificates: number;
  learners: LearnerRow[];
  learnerCount: number;
  pools: { id: string; courseTitle: string; seats: number; taken: number; budget: number }[];
  payments: { id: string; at: string; text: string; amount?: number; tx: string; kind: "topup" | "budget" | "review" | "certificate" }[];
  paidToMentors: number;
  stillInWallets: number;
};

export async function sponsorSummary(sponsorId: string): Promise<SponsorSummary> {
  const doc = await load();
  const sponsor = await findUserById(sponsorId);
  const mine = doc.sponsorships.filter((s) => s.sponsorId === sponsorId);
  const payments = doc.payments.filter((p) => p.sponsorId === sponsorId);
  const learnerIds = [...new Set(mine.flatMap((s) => (s.learnerId ? [s.learnerId] : [])))];
  const users = new Map(await Promise.all(learnerIds.map(async (learnerId) => [learnerId, await findUserById(learnerId)] as const)));
  const certificates = new Map(await Promise.all(learnerIds.map(async (learnerId) => [learnerId, await certificatesFor(learnerId)] as const)));

  // A direct sponsorship follows the course she is on now.
  const slugOf = (s: Sponsorship) => s.courseSlug ?? (s.learnerId ? users.get(s.learnerId)?.startedCourses.at(-1) : undefined);

  const learners: LearnerRow[] = mine.map((s) => {
    const course = slugOf(s) ? findCourse(slugOf(s)!) : undefined;
    const user = s.learnerId ? users.get(s.learnerId) : undefined;
    const done = course ? (user?.modulesDone?.[course.slug] ?? 0) : 0;
    const funded = payments.some((p) => p.kind === "budget" && p.learnerId === s.learnerId && s.learnerId);
    const certified = Boolean(course && s.learnerId && certificates.get(s.learnerId)?.some((c) => c.courseSlug === course.slug));
    return {
      id: s.id,
      name: user?.name ?? s.label ?? "Invited learner",
      courseTitle: course?.title ?? "No course yet",
      how: s.kind === "invite" ? "invited" : s.kind === "seat" ? "seat" : "sent by ID",
      status: !s.learnerId ? "pending" : certified ? "certified" : funded ? "learning" : "funding",
      percent: course ? Math.round((done / course.modules.length) * 100) : 0,
      used: payments.filter((p) => p.kind === "review" && p.learnerId === s.learnerId).reduce((sum, p) => sum + p.amount, 0),
      budget: s.budget,
      token: s.token,
    };
  });

  const totalGiven = payments.filter((p) => p.kind === "budget").reduce((sum, p) => sum + p.amount, 0);
  const paidToMentors = payments.filter((p) => p.kind === "review").reduce((sum, p) => sum + p.amount, 0);
  const coins = mine.reduce((sum, s) => {
    const course = slugOf(s) ? findCourse(slugOf(s)!) : undefined;
    return sum + (course && s.learnerId ? Math.min(users.get(s.learnerId)?.modulesDone?.[course.slug] ?? 0, course.modules.length) : 0);
  }, 0);

  const earned = mine.flatMap((s) =>
    s.learnerId ? (certificates.get(s.learnerId) ?? []).filter((c) => c.courseSlug === slugOf(s) && c.transaction).map((c) => ({ c, name: users.get(s.learnerId!)?.name ?? "She" })) : [],
  );

  return {
    balance: sponsor?.wallet ? await usdcBalanceOrZero(sponsor.wallet.publicKey) : 0,
    address: sponsor?.wallet?.publicKey,
    totalGiven,
    coins,
    certificates: learners.filter((l) => l.status === "certified").length,
    learners,
    learnerCount: learners.filter((l) => l.status !== "pending").length,
    pools: doc.pools
      .filter((p) => p.sponsorId === sponsorId)
      .map((p) => ({ id: p.id, courseTitle: findCourse(p.courseSlug)!.title, seats: p.seats, taken: doc.sponsorships.filter((s) => s.poolId === p.id).length, budget: p.budget })),
    payments: [
      ...payments.map((p) => ({
        id: p.id,
        at: p.at,
        kind: p.kind,
        amount: p.amount,
        tx: p.tx,
        text:
          p.kind === "topup"
            ? "You added USDC to your wallet"
            : p.kind === "budget"
              ? `Budget sent to ${users.get(p.learnerId!)?.name ?? "a learner"}'s wallet`
              : `${users.get(p.learnerId!)?.name ?? "A learner"} paid a mentor review`,
      })),
      ...earned.map(({ c, name }) => ({ id: c.id, at: c.issuedAt, kind: "certificate" as const, tx: c.transaction!, text: `${name}'s certificate was issued` })),
    ].sort((a, b) => b.at.localeCompare(a.at)),
    paidToMentors,
    stillInWallets: Math.max(0, totalGiven - paidToMentors),
  };
}
