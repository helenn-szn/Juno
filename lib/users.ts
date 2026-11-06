// Learner accounts, kept in one JSON file (data/users.json, never committed).
// Passwords are stored as scrypt hashes. Each learner gets a testnet wallet,
// created in the background after sign-up; she never sees the keys.
import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Keypair } from "@stellar/stellar-sdk";
import { openWallet } from "./stellar";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  startedCourses: string[];
  wallet?: { publicKey: string; secret: string };
};

const FILE = path.join(process.cwd(), "data", "users.json");

async function readAll(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeAll(users: User[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(users, null, 2));
}

export async function findUserById(id: string) {
  return (await readAll()).find((user) => user.id === id);
}

export async function findUserByEmail(email: string) {
  return (await readAll()).find((user) => user.email === email.toLowerCase());
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    startedCourses: [],
  };
  await writeAll([...(await readAll()), user]);
  return user;
}

export async function updateUser(id: string, change: (user: User) => User) {
  const users = await readAll();
  await writeAll(users.map((user) => (user.id === id ? change(user) : user)));
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
