// Certificates. One is issued when a learner finishes every module of a course.
// It gets a short random public id (the QR code points at /verify/[id]) and, a moment
// later, a record on Stellar: the juno wallet sends a transaction with the id as its memo.
// Stored in Redis on the live site, data/certificates.json on your machine.
import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Asset, Operation } from "@stellar/stellar-sdk";
import { Redis } from "@upstash/redis";
import { findCourse } from "./courses";
import { submitWithMemo, wallet } from "./stellar";

export type Certificate = {
  id: string;
  userId: string;
  name: string;
  courseSlug: string;
  courseTitle: string;
  issuedAt: string;
  transaction?: string; // the Stellar record, once it is written
};

const redis = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? Redis.fromEnv() : null;
const FILE = path.join(process.cwd(), "data", "certificates.json");

async function readFile(): Promise<Certificate[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function save(certificate: Certificate) {
  if (redis) {
    await redis.set(`cert:${certificate.id}`, certificate);
    await redis.sadd(`certs:${certificate.userId}`, certificate.id);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const others = (await readFile()).filter((c) => c.id !== certificate.id);
  await fs.writeFile(FILE, JSON.stringify([...others, certificate], null, 2));
}

export async function findCertificate(id: string) {
  if (redis) return (await redis.get<Certificate>(`cert:${id}`)) ?? undefined;
  return (await readFile()).find((c) => c.id === id);
}

export async function certificatesFor(userId: string): Promise<Certificate[]> {
  const all = redis
    ? await Promise.all(((await redis.smembers(`certs:${userId}`)) as string[]).map(findCertificate))
    : await readFile();
  return all
    .filter((c): c is Certificate => Boolean(c) && c!.userId === userId)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

/** Issues her certificate for a course, once. Asking again returns the same one. */
export async function issueCertificate(user: { id: string; name: string }, course: { slug: string; title: string }) {
  const existing = (await certificatesFor(user.id)).find((c) => c.courseSlug === course.slug);
  if (existing) return existing;
  const certificate: Certificate = {
    id: crypto.randomBytes(15).toString("base64url"), // 20 characters, short enough for a Stellar memo
    userId: user.id,
    name: user.name,
    courseSlug: course.slug,
    courseTitle: course.title,
    issuedAt: new Date().toISOString(),
  };
  await save(certificate);
  return certificate;
}

/** The details a certificate shows besides what is stored: course level, skill coins and her mentor. */
export function certificateFacts(certificate: Certificate) {
  const course = findCourse(certificate.courseSlug);
  return {
    level: course?.level ?? "Beginner",
    coins: course?.modules.length ?? 0,
    mentor: "Zainab", // the one demo mentor, until real mentor matching exists
  };
}

/** Records the certificate on Stellar: a tiny transaction whose memo is the certificate id. */
export async function recordOnStellar(id: string) {
  const certificate = await findCertificate(id);
  const juno = wallet("juno");
  if (!certificate || certificate.transaction || !juno) return;
  // A payment of the smallest possible amount to itself: it leaves nothing behind but the record.
  const record = () =>
    submitWithMemo(juno, id, Operation.payment({ destination: juno.publicKey(), asset: Asset.native(), amount: "0.0000001" }));
  // The juno wallet also pays fees for x402 payments; if both land at once, try again.
  const transaction = await record().catch(() => record());
  await save({ ...certificate, transaction });
}
