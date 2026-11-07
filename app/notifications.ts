"use server";
// What the bell in the header asks for: the latest notifications, and "I've seen them".
import { notificationsFor, type Notification } from "@/lib/notifications";
import { currentUser } from "@/lib/session";
import { updateUser } from "@/lib/users";

export type Bell = { notes: Notification[]; seenAt: string | null };

export async function loadBell(): Promise<Bell> {
  const user = await currentUser();
  if (!user) return { notes: [], seenAt: null };
  return { notes: await notificationsFor(user.id), seenAt: user.notificationsSeenAt ?? null };
}

export async function markBellSeen(): Promise<void> {
  const user = await currentUser();
  if (user) await updateUser(user.id, (u) => ({ ...u, notificationsSeenAt: new Date().toISOString() }));
}
