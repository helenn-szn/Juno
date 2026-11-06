// Before her first course: a few questions about what she knows and when she can study.
// Juno.ai can ask the same questions in the chat; both save the same answers.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { findCourse } from "@/lib/courses";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your learning plan · juno" };

export default function Onboarding(props: PageProps<"/app/onboarding">) {
  return (
    <>
      <TopBar title="Your learning plan" />
      <Suspense fallback={<PageSpinner />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/app/onboarding">, "searchParams">) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const next = String((await searchParams).next ?? "");
  return <OnboardingForm next={findCourse(next) ? next : undefined} initial={user.profile} />;
}
