// Public: anyone can scan a certificate's QR code and land here to check it is real.
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightUpLine, RiCheckboxCircleFill } from "@remixicon/react";
import { CoinFan } from "@/components/coin-fan";
import { certificateDate } from "@/components/certificate-card";
import { findCertificate } from "@/lib/certificates";
import { explorer } from "@/lib/constants";

export const metadata: Metadata = { title: "Check a certificate · juno", robots: { index: false } };

export default function Verify(props: PageProps<"/verify/[id]">) {
  return (
    <main className="app-light flex min-h-dvh flex-col items-center gap-8 bg-background-full px-6 py-12 text-text-primary">
      <Link href="/" className="flex min-h-11 items-center gap-2" aria-label="juno home">
        <CoinFan theme="light" className="h-8 w-11.5" />
        <span className="text-wordmark text-text-accent">juno</span>
      </Link>
      <Suspense fallback={<p className="text-body-regular text-text-secondary">Checking…</p>}>
        <Result params={props.params} />
      </Suspense>
    </main>
  );
}

async function Result({ params }: Pick<PageProps<"/verify/[id]">, "params">) {
  const id = (await params).id;
  const certificate = /^[0-9a-f-]{36}$/.test(id) ? await findCertificate(id) : undefined;

  if (!certificate) {
    return (
      <section className="flex max-w-120 flex-col gap-3 rounded-2xl border border-line p-6 text-center">
        <h1 className="text-title-2-medium">We can&apos;t find that certificate</h1>
        <p className="text-body-regular text-text-secondary">Check the link or scan the QR code again. If it still fails, ask the person who shared it.</p>
      </section>
    );
  }

  return (
    <section className="on-dark flex w-full max-w-120 flex-col gap-5 rounded-[20px] bg-green p-7">
      <p className="flex items-center gap-2 text-title-3-medium text-neon">
        <RiCheckboxCircleFill className="size-6" aria-hidden /> This certificate is real
      </p>
      <dl className="flex flex-col divide-y divide-separator-border">
        {[
          ["Learner", certificate.name],
          ["Skill", certificate.courseTitle],
          ["Date", certificateDate(certificate.issuedAt)],
          ["Issued by", "Juno"],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 py-3">
            <dt className="text-body-2-regular text-text-tertiary">{label}</dt>
            <dd className="text-copy">{value}</dd>
          </div>
        ))}
      </dl>
      {certificate.transaction ? (
        <a
          href={explorer.tx(certificate.transaction)}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-purple px-4 text-body-medium text-dark-green outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          See the Stellar record
          <RiArrowRightUpLine className="size-5" aria-hidden />
        </a>
      ) : (
        <p className="text-body-regular text-text-secondary">Its Stellar record is being written. Check again in a minute.</p>
      )}
    </section>
  );
}
