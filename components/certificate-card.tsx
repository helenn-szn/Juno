// A certificate on screen: her name, the course, the date, her mentor and the QR code.
/* eslint-disable @next/next/no-img-element -- the QR code is a generated data URL */
import type { Certificate } from "@/lib/certificates";

export const certificateDate = (issuedAt: string) =>
  new Date(issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function CertificateCard({ certificate, qr }: { certificate: Certificate; qr: string }) {
  return (
    <figure className="flex flex-col gap-5 rounded-[20px] border-2 border-green bg-white p-6 text-center sm:p-9">
      <figcaption className="text-body-2-regular tracking-[0.08em] text-text-secondary uppercase">Certificate of completion</figcaption>
      <div className="flex flex-col gap-1.5">
        <span className="text-body-regular text-text-secondary">This certifies that</span>
        <span className="text-display-4-medium tracking-[-0.03em] break-words">{certificate.name}</span>
        <span className="text-body-regular text-text-secondary">has finished every module of</span>
        <span className="text-title-1-medium tracking-[-0.03em] text-green">{certificate.courseTitle}</span>
      </div>
      <div className="flex items-center justify-center gap-4 text-left">
        <img src={qr} alt="QR code that checks this certificate" width={96} height={96} className="size-24 shrink-0" />
        <div className="flex flex-col gap-0.5 text-body-2-regular text-text-secondary">
          <span>{certificateDate(certificate.issuedAt)}</span>
          <span>Issued by Juno</span>
          <span>Scan to check it&apos;s real</span>
        </div>
      </div>
    </figure>
  );
}
