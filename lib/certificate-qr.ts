// The QR code on a certificate: it points at the public verify page.
import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

/** The public link anyone can open to check a certificate. */
export async function verifyUrl(id: string) {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const protocol = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}/verify/${id}`;
}

export const qrPng = (url: string, width = 320) => QRCode.toDataURL(url, { margin: 1, width });
