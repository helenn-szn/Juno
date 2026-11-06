// GET /api/certificates/[id]/pdf  →  her certificate as a PDF. Only its owner can download it.
import { NextResponse } from "next/server";
import { verifyUrl, qrPng } from "@/lib/certificate-qr";
import { certificatePdf } from "@/lib/certificate-pdf";
import { findCertificate } from "@/lib/certificates";
import { currentUser } from "@/lib/session";

export async function GET(_: Request, { params }: RouteContext<"/api/certificates/[id]/pdf">) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  const certificate = await findCertificate((await params).id);
  if (!certificate || certificate.userId !== user.id) return NextResponse.json({ error: "not-found" }, { status: 404 });

  const url = await verifyUrl(certificate.id);
  const bytes = await certificatePdf(certificate, url, await qrPng(url, 400));
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="juno-${certificate.courseSlug}-certificate.pdf"`,
    },
  });
}
