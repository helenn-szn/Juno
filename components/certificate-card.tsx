// A certificate on screen, from Certificate.dc.html: her details on the left, the coin
// fan, the Stellar record and the QR code on the right. On a phone the two stack.
/* eslint-disable @next/next/no-img-element -- the QR code is a generated data URL */
import { CoinFan } from "@/components/coin-fan";
import { certificateFacts, type Certificate } from "@/lib/certificates";

export const certificateDate = (issuedAt: string) =>
  new Date(issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function CertificateCard({ certificate, qr }: { certificate: Certificate; qr: string }) {
  const facts = certificateFacts(certificate);
  return (
    <figure className="flex flex-col md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-10 rounded-t-2xl border-[1.5px] border-green bg-white p-7 md:rounded-se-none md:rounded-es-2xl md:border-e-0 md:px-14 md:py-12">
        <div className="flex items-center gap-2">
          <CoinFan theme="light" className="h-8 w-11" />
          <span className="text-wordmark-sm text-text-accent">juno</span>
        </div>

        <div className="flex flex-col items-start gap-3.5">
          <span className="text-body-2-regular tracking-[0.28em] text-green uppercase">Certificate of completion</span>
          <span className="text-copy text-text-secondary">This certifies that</span>
          <span className="text-[clamp(2.25rem,6vw,3.625rem)] leading-[1.05] font-medium tracking-[-0.045em] break-words">{certificate.name}</span>
          <span className="text-copy text-text-secondary">has completed the course</span>
          <span className="rounded-[10px] bg-radiant px-3.5 py-1.5 text-title-2-medium tracking-[-0.03em] text-green">{certificate.courseTitle}</span>
        </div>

        <dl className="grid max-w-140 grid-cols-1 gap-4 min-[420px]:grid-cols-3 min-[420px]:gap-6">
          {[
            ["Date issued", certificateDate(certificate.issuedAt)],
            ["Level", facts.level],
            ["Skill coins earned", String(facts.coins)],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-body-2-regular text-text-secondary">{label}</dt>
              <dd className="text-body-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto grid max-w-140 grid-cols-2 gap-6 pt-6 md:gap-12">
          {[
            [facts.mentor, "Reviewing mentor"],
            ["Juno", "Issuer"],
          ].map(([name, role]) => (
            <div key={role} className="flex flex-col gap-1.5">
              <span className="h-10 border-b border-dark-green" aria-hidden />
              <span className="text-body-medium">{name}</span>
              <span className="text-body-2-regular text-text-secondary">{role}</span>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="on-dark flex flex-col items-center gap-5 rounded-b-2xl bg-green px-8 py-10 md:w-80 md:shrink-0 md:rounded-ee-2xl md:rounded-bs-none md:rounded-se-2xl">
        <CoinFan surface="stroke-green" className="w-55" />
        {certificate.transaction ? (
          <span className="rounded-full bg-purple px-3.5 py-1.5 text-body-2-medium text-dark-green">Verified on Stellar</span>
        ) : (
          <span className="rounded-full border border-separator-border px-3.5 py-1.5 text-body-2-regular text-text-secondary">Being recorded on Stellar</span>
        )}
        <div className="mt-4 rounded-xl bg-white p-3 md:mt-auto">
          <img src={qr} alt="QR code that opens this certificate's verification page" width={120} height={120} className="size-30" />
        </div>
        <span className="text-body-2-regular text-text-secondary">Scan to verify</span>
        <div className="flex w-full flex-col gap-1.5 border-t border-separator-border pt-4 font-mono text-[11px] leading-snug break-all text-text-secondary">
          <span>ID · {certificate.id}</span>
          <span>Tx · {certificate.transaction ?? "…"}</span>
        </div>
      </figcaption>
    </figure>
  );
}
