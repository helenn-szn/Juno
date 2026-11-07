// Notifications: short updates shown under the bell in every dashboard header.
// Each person has their own list (newest first, the last 30). Writing one never breaks the thing
// that caused it: if saving fails, we only log it.
// Kept in Redis on the live site, data/notifications.json on your machine.
import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

export type Notification = {
  id: string;
  kind: "paid" | "funded" | "skill" | "info"; // decides the little coloured dot
  title: string;
  text: string;
  at: string;
  tx?: string; // a Stellar transaction to link to
  href?: string; // a page inside Juno to link to
};

const KEEP = 30;
const redis = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? Redis.fromEnv() : null;
const FILE = path.join(process.cwd(), "data", "notifications.json");

async function readFile(): Promise<Record<string, Notification[]>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

export async function notificationsFor(userId: string): Promise<Notification[]> {
  if (redis) return ((await redis.lrange<Notification>(`notes:${userId}`, 0, KEEP - 1)) ?? []).filter(Boolean);
  return (await readFile())[userId] ?? [];
}

/** Tells one person something. Best effort: a failure here must never undo the payment or step behind it. */
export async function notify(userId: string, note: Omit<Notification, "id" | "at">) {
  const full: Notification = { id: crypto.randomBytes(6).toString("base64url"), at: new Date().toISOString(), ...note };
  try {
    if (redis) {
      await redis.lpush(`notes:${userId}`, full);
      await redis.ltrim(`notes:${userId}`, 0, KEEP - 1);
      return;
    }
    const all = await readFile();
    all[userId] = [full, ...(all[userId] ?? [])].slice(0, KEEP);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  } catch (error) {
    console.error("Could not save a notification:", error);
  }
}

export const usdc = (amount: number) => `${amount.toFixed(2)} USDC`;
