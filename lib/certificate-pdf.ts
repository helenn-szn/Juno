// The certificate as a PDF: one landscape page with her name, the course, the date,
// her mentor and a QR code to the public verify page.
// pdf-lib draws colours as 0 to 1 numbers: green is #004D43, ink is #183132, muted is #4A615E.
import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Certificate } from "./certificates";

const green = rgb(0, 0.302, 0.263);
const ink = rgb(0.094, 0.192, 0.196);
const muted = rgb(0.29, 0.38, 0.369);

export async function certificatePdf(certificate: Certificate, verifyUrl: string, qrDataUrl: string) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${certificate.courseTitle} certificate`);
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const centre = (text: string, y: number, size: number, font = regular, color = ink) =>
    page.drawText(text, { x: (842 - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });

  page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderColor: green, borderWidth: 3 });
  centre("juno", 505, 30, bold, green);
  centre("Certificate of completion", 440, 16, regular, muted);
  centre("This certifies that", 395, 14, regular, muted);
  centre(certificate.name, 345, 40, bold, ink);
  centre("has finished every module of", 305, 14, regular, muted);
  centre(certificate.courseTitle, 258, 28, bold, green);
  const date = new Date(certificate.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  centre(`${date}  ·  Issued by Juno`, 215, 13, regular, muted);

  const qr = await pdf.embedPng(qrDataUrl);
  page.drawImage(qr, { x: 371, y: 70, width: 100, height: 100 });
  centre("Scan to check this certificate is real", 52, 10, regular, muted);
  centre(verifyUrl, 38, 8, regular, muted);
  return pdf.save();
}
