// One certificate: see it, download the PDF, copy the link anyone can use to check it.
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RiArrowRightUpLine, RiDownloadLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { CertificateCard } from "@/components/certificate-card";
import { CopyLink } from "@/components/copy-link";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { qrPng, verifyUrl } from "@/lib/certificate-qr";
import { findCertificate } from "@/lib/certificates";
import { explorer } from "@/lib/constants";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Certificate · juno" };

export default function CertificatePage(props: PageProps<"/app/certificates/[id]">) {
  return (
    <>
      <TopBar title="Certificate" back={{ href: "/app/certificates", label: "Back to certificates" }} />
      <Suspense fallback={<PageSpinner />}>
        <Certificate params={props.params} />
      </Suspense>
    </>
  );
}

async function Certificate({ params }: Pick<PageProps<"/app/certificates/[id]">, "params">) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const certificate = await findCertificate((await params).id);
  if (!certificate || certificate.userId !== user.id) notFound();

  const url = await verifyUrl(certificate.id);
  const qr = await qrPng(url);

  return (
    <div className="flex max-w-250 flex-col gap-5 p-6 lg:p-7">
      <p className="text-title-3-medium">Skill minted. That&apos;s yours forever.</p>
      <CertificateCard certificate={certificate} qr={qr} />
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={`/api/certificates/${certificate.id}/pdf`} leadingIcon={RiDownloadLine} className="h-11 rounded-full px-5 shadow-none">
          Download PDF
        </ButtonLink>
        <CopyLink url={url}>Copy verify link</CopyLink>
        <ButtonLink href="https://stallion.so" variant="secondary" trailingIcon={RiArrowRightUpLine} className="h-11 rounded-full px-5 shadow-none">
          Find work on Stallion
        </ButtonLink>
      </div>
      {certificate.transaction ? (
        <a
          href={explorer.tx(certificate.transaction)}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center gap-2 self-start rounded-full bg-purple px-4 text-body-medium text-dark-green outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          See the record on Stellar
          <RiArrowRightUpLine className="size-5" aria-hidden />
        </a>
      ) : (
        <p className="text-body-regular text-text-secondary" aria-live="polite">Writing your record on Stellar. Refresh in a minute to see its link.</p>
      )}
    </div>
  );
}
