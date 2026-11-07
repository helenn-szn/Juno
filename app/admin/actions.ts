"use server";
// What the Juno team does: approve a mentor, ask for changes, refund a late review.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findRequest, refund } from "@/lib/mentors";
import { notify } from "@/lib/notifications";
import { currentUser } from "@/lib/session";
import { findUserById, updateUser } from "@/lib/users";

async function admin() {
  const user = await currentUser();
  if (user?.role !== "admin") redirect("/login");
}

export async function approveMentor(userId: string) {
  await admin();
  const mentor = await findUserById(userId);
  if (mentor?.role !== "mentor" || !mentor.mentor) return;
  await updateUser(userId, (u) => ({ ...u, mentor: u.mentor && { ...u.mentor, status: "approved", note: undefined } }));
  await notify(userId, { kind: "info", title: "You're approved", text: "Welcome to Juno. Requests can now come in.", href: "/app" });
  revalidatePath("/admin");
}

/** "Not yet": her application reopens with this note at the top. */
export async function askForChanges(userId: string, note: string) {
  await admin();
  const mentor = await findUserById(userId);
  if (mentor?.role !== "mentor" || !mentor.mentor) return;
  const message = note.trim() || "Please add a little more about your experience and a link to your work.";
  await updateUser(userId, (u) => ({ ...u, mentor: u.mentor && { ...u.mentor, status: "changes", note: message.slice(0, 400) } }));
  await notify(userId, { kind: "info", title: "Not yet", text: message.slice(0, 160), href: "/app" });
  revalidatePath("/admin");
}

/** A mentor missed the 48 hours: the money goes back to the learner. */
export async function refundReview(requestId: string): Promise<{ ok: boolean; reason?: string }> {
  await admin();
  const request = await findRequest(requestId);
  if (!request || request.status !== "accepted" || !request.dueAt || new Date(request.dueAt).getTime() > Date.now()) return { ok: false, reason: "That review isn't overdue." };
  try {
    await refund(request);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Refund failed:", error);
    return { ok: false, reason: "The refund didn't go through. Try again?" };
  }
}
