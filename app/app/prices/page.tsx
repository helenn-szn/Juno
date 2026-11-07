// A mentor edits her prices and courses.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MentorPricesForm } from "@/components/mentor-prices-form";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Prices · juno" };

export default function Prices() {
  return (
    <>
      <TopBar title="Prices" back={{ href: "/app", label: "Back to requests" }} />
      <Suspense fallback={<PageSpinner />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "mentor" || user.mentor?.status !== "approved") redirect("/app");
  return <MentorPricesForm mentor={user.mentor} />;
}
