import type { Metadata } from "next";
import { InviteForm } from "@/components/sponsor-forms";
import { TopBar } from "@/components/top-bar";

export const metadata: Metadata = { title: "Invite a learner · juno" };

export default function Invite() {
  return (
    <>
      <TopBar title="Invite a learner" back={{ href: "/sponsor", label: "Back to overview" }} />
      <InviteForm />
    </>
  );
}
