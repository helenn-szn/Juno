// Learner accounts. On the live site they sit in Redis (Upstash, added from the
// Vercel dashboard). On your own machine they sit in data/users.json, never
// committed, so local development needs no setup.
// Passwords are stored as scrypt hashes. Each learner gets a testnet wallet,
// created in the background after sign-up; she never sees the keys.
import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Keypair } from "@stellar/stellar-sdk";
import { Redis } from "@upstash/redis";
import type { Profile } from "./profile";
import { openWallet } from "./stellar";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: "learner" | "sponsor"; // sponsors fund learners; no role means learner
  createdAt: string;
  startedCourses: string[];
  profile?: Profile; // her answers before the first course: experience, goal and schedule
  avatar?: string; // link to her profile picture
  notificationsSeenAt?: string; // when she last opened the bell; newer notifications are "new"
  junoId?: string; // her short, shareable ID, like JN-7K2Q9 (learners only)
  modulesDone?: Record<string, number>; // finished modules per course slug
  lessonsDone?: Record<string, number[]>; // finished lessons of her current module, per course slug
  wallet?: { publicKey: string; secret: string };
};

// Vercel's Upstash integration sets KV_REST_API_*; Upstash itself sets UPSTASH_REDIS_REST_*.
const redis = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? Redis.fromEnv() : null;

const FILE = path.join(process.cwd(), "data", "users.json");

async function readFile(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeFile(users: User[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(users, null, 2));
}

export async function findUserById(id: string) {
  if (redis) return (await redis.get<User>(`user:${id}`)) ?? undefined;
  return (await readFile()).find((user) => user.id === id);
}

export async function findUserByEmail(email: string) {
  const address = email.toLowerCase();
  if (redis) {
    const id = await redis.get<string>(`email:${address}`);
    return id ? findUserById(id) : undefined;
  }
  return (await readFile()).find((user) => user.email === address);
}

// Juno IDs: "JN-" and 5 characters, with nothing that looks like another (no 0/O, 1/I/L).
export const JUNO_ID_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const JUNO_ID_PATTERN = /^JN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/;

const newJunoId = () => "JN-" + Array.from(crypto.randomBytes(5), (byte) => JUNO_ID_CHARS[byte % JUNO_ID_CHARS.length]).join("");

export async function findUserByJunoId(junoId: string) {
  if (!JUNO_ID_PATTERN.test(junoId)) return undefined;
  if (redis) {
    const id = await redis.get<string>(`junoid:${junoId}`);
    return id ? findUserById(id) : undefined;
  }
  return (await readFile()).find((user) => user.junoId === junoId);
}

// Picks an ID nobody has yet and keeps it for this learner. Accounts made before IDs existed get theirs the first time it's needed.
export async function ensureJunoId(user: User) {
  if (user.junoId || user.role === "sponsor") return user.junoId;
  for (let attempt = 0; attempt < 10; attempt++) {
    const junoId = newJunoId();
    if (redis) {
      if (!(await redis.set(`junoid:${junoId}`, user.id, { nx: true }))) continue;
    } else if (await findUserByJunoId(junoId)) continue;
    await updateUser(user.id, (u) => ({ ...u, junoId }));
    return junoId;
  }
}

export async function createUser(name: string, email: string, password: string, role: "learner" | "sponsor" = "learner"): Promise<User> {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
    startedCourses: [],
  };
  if (redis) {
    // Claiming the email is atomic, so two sign-ups can never share one address.
    if (!(await redis.set(`email:${user.email}`, user.id, { nx: true }))) throw new Error("That email is taken.");
    await redis.set(`user:${user.id}`, user);
  } else {
    await writeFile([...(await readFile()), user]);
  }
  // Every learner gets her Juno ID at sign-up.
  const junoId = await ensureJunoId(user);
  return junoId ? { ...user, junoId } : user;
}

export async function updateUser(id: string, change: (user: User) => User) {
  const user = await findUserById(id);
  if (!user) return;
  const next = change(user);
  if (redis) await redis.set(`user:${id}`, next);
  else await writeFile((await readFile()).map((u) => (u.id === id ? next : u)));
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const attempt = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(attempt, Buffer.from(hash, "hex"));
}

// Creates the learner's testnet wallet the first time, then gets it ready
// (see openWallet). Safe to call again.
export async function setUpWallet(userId: string) {
  const user = await findUserById(userId);
  if (!user) return;
  const keypair = user.wallet ? Keypair.fromSecret(user.wallet.secret) : Keypair.random();
  if (!user.wallet) {
    await updateUser(userId, (u) => ({ ...u, wallet: { publicKey: keypair.publicKey(), secret: keypair.secret() } }));
  }
  await openWallet(keypair);
}
