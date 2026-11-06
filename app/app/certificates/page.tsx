// Every certificate she has earned.
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RiArrowRightLine } from "@remixicon/react";
import { certificateDate } from "@/components/certificate-card";
import { Empty } from "@/components/page-grid";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { certificatesFor } from "@/lib/certificates";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Certificates · juno" };

export default function Certificates() {
  return (
    <>
      <TopBar title="Certificates" />
      <Suspense fallback={<PageSpinner />}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const certificates = await certificatesFor(user.id);

  return (
    <div className="p-6 lg:p-7">
      {certificates.length ? (
        <ul className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
          {certificates.map((certificate) => (
            <li key={certificate.id}>
              <Link
                href={`/app/certificates/${certificate.id}`}
                className="on-dark flex min-h-11 items-center gap-3 rounded-2xl bg-green p-5 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-headline-medium">{certificate.courseTitle}</span>
                  <span className="text-body-2-regular text-text-tertiary">{certificateDate(certificate.issuedAt)}</span>
                </span>
                <RiArrowRightLine className="size-5 shrink-0 text-radiant" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No certificates yet. Finish a course and yours will be here.</Empty>
      )}
    </div>
  );
}
