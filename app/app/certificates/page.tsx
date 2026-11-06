import type { Metadata } from "next";
import { Empty } from "@/components/page-grid";
import { TopBar } from "@/components/top-bar";

export const metadata: Metadata = { title: "Certificates · juno" };

export default function Certificates() {
  return (
    <>
      <TopBar title="Certificates" />
      <div className="p-6 lg:p-7">
        <Empty>No certificates yet. Finish a course and yours will be here.</Empty>
      </div>
    </>
  );
}
