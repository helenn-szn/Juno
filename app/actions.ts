"use server";
// Everything a learner does that changes data: create account, log in,
// log out, start a course. Each action checks the session itself.
import { redirect } from "next/navigation";
import { after } from "next/server";
import { findCourse } from "@/lib/courses";
import { currentUser, endSession, startSession } from "@/lib/session";
import { checkPassword, createUser, findUserByEmail, setUpWallet, updateUser } from "@/lib/users";

export type FormState = { errors?: Record<string, string>; values?: Record<string, string> };

function field(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

// Opens her wallet after the response is sent, so sign-up never waits on Stellar.
function setUpWalletLater(userId: string) {
  after(() => setUpWallet(userId).catch((error) => console.error("Wallet set-up failed:", error)));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const name = field(form, "name");
  const email = field(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Tell us your name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "That email doesn't look right.";
  else if (await findUserByEmail(email)) errors.email = "You already have an account. Log in instead?";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (Object.keys(errors).length) return { errors, values: { name, email } };

  const user = await createUser(name, email, password);
  await startSession(user.id);
  setUpWalletLater(user.id);
  redirect("/app");
}

export async function logIn(_: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email").toLowerCase();
  const user = await findUserByEmail(email);
  if (!user || !checkPassword(String(form.get("password") ?? ""), user.passwordHash)) {
    return { errors: { password: "That email and password don't match." }, values: { email } };
  }
  await startSession(user.id);
  if (!user.wallet) setUpWalletLater(user.id); // in case set-up failed at sign-up
  redirect("/app");
}

export async function logOut() {
  await endSession();
  redirect("/");
}

export async function startCourse(slug: string) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!findCourse(slug)) return;
  if (!user.startedCourses.includes(slug)) {
    await updateUser(user.id, (u) => ({ ...u, startedCourses: [...u.startedCourses, slug] }));
  }
  redirect(`/app/courses/${slug}/learn`);
}
