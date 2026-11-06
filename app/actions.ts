"use server";
// Everything a learner does that changes data: create account, log in,
// log out, start a course. Each action checks the session itself.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { issueCertificate, recordOnStellar } from "@/lib/certificates";
import { findCourse, requiredLessons } from "@/lib/courses";
import { profileSchema } from "@/lib/profile";
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
  // Before her first course we ask about her schedule and what she already knows.
  if (!user.profile) redirect(`/app/onboarding?next=${slug}`);
  if (!user.startedCourses.includes(slug)) {
    await updateUser(user.id, (u) => ({ ...u, startedCourses: [...u.startedCourses, slug] }));
  }
  redirect(`/app/courses/${slug}/learn`);
}

// She finishes a lesson. When the last lesson of her module is done the next module
// opens, and finishing the last module earns her certificate.
export async function completeLesson(slug: string, lessonIndex: number) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const course = findCourse(slug);
  if (!course) return;

  const done = user.modulesDone?.[slug] ?? 0;
  const unit = course.modules[done];
  if (!unit || !unit.lessons[lessonIndex] || unit.lessons[lessonIndex].kind === "review") return;

  const lessons = [...new Set([...(user.lessonsDone?.[slug] ?? []), lessonIndex])];
  const moduleFinished = requiredLessons(unit).every((index) => lessons.includes(index));
  await updateUser(user.id, (u) => ({
    ...u,
    startedCourses: u.startedCourses.includes(slug) ? u.startedCourses : [...u.startedCourses, slug],
    modulesDone: { ...u.modulesDone, [slug]: moduleFinished ? done + 1 : done },
    lessonsDone: { ...u.lessonsDone, [slug]: moduleFinished ? [] : lessons },
  }));
  revalidatePath("/app", "layout");

  if (moduleFinished && done + 1 === course.modules.length) {
    const certificate = await issueCertificate(user, course);
    after(() => recordOnStellar(certificate.id).catch((error) => console.error("Certificate record failed:", error)));
    redirect(`/app/certificates/${certificate.id}`);
  }
}

// Saves what she told us about herself, then carries on to the course she wanted
// (or her dashboard). The same answers can be given to Juno.ai in the chat.
export async function saveProfile(next: string | undefined, _: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect("/login");
  const parsed = profileSchema.safeParse({
    experience: form.get("experience"),
    goal: form.get("goal"),
    background: field(form, "background"),
    hoursPerWeek: Number(form.get("hoursPerWeek")),
    days: form.getAll("days"),
    time: form.get("time"),
  });
  if (!parsed.success) return { errors: { form: "Something is missing. Check each step and try again." } };

  await updateUser(user.id, (u) => ({ ...u, profile: parsed.data }));
  revalidatePath("/app", "layout");
  if (next && findCourse(next)) await startCourse(next); // redirects into the course
  redirect("/app");
}
