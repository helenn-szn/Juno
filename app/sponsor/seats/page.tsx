import type { Metadata } from "next";
import { SeatsForm } from "@/components/sponsor-forms";
import { TopBar } from "@/components/top-bar";

export const metadata: Metadata = { title: "Fund course seats · juno" };

export default function Seats() {
  return (
    <>
      <TopBar title="Fund course seats" back={{ href: "/sponsor", label: "Back to overview" }} />
      <SeatsForm />
    </>
  );
}
