// Mentor onboarding, built from MentorOnboard.dc.html. Open to everyone. A mentor who was told "Not yet"
// comes back here with the team's note at the top and her answers filled in.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApplyHeader, MentorApplyForm, type ApplyInitial } from "@/components/mentor-apply-form";
import { PageSpinner } from "@/components/page-spinner";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Apply to mentor · juno" };

export default function Apply() {
  return (
    <div className="app-light min-h-dvh bg-background-full text-text-primary">
      <ApplyHeader />
      <Suspense fallback={<PageSpinner />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  const user = await currentUser();
  if (user && (user.role !== "mentor" || (user.mentor && user.mentor.status !== "changes"))) redirect("/app");
  const mentor = user?.mentor;
  const initial: ApplyInitial | undefined =
    user && !mentor
      ? { signedIn: true, name: user.name, email: user.email, country: "", bio: "", link: "", courses: [], prices: {} }
      : user && mentor
      ? { signedIn: true, name: user.name, email: user.email, country: mentor.country, bio: mentor.bio, link: mentor.link, courses: mentor.courses, prices: mentor.prices, note: mentor.note }
      : undefined;
  return <MentorApplyForm initial={initial} />;
}
