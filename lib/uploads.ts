// Where uploaded images are kept. On the live site: Vercel Blob (add a Blob store
// from the Vercel dashboard; it sets BLOB_READ_WRITE_TOKEN). On your own machine:
// public/uploads, never committed, so local development needs no setup.
// Each file gets a random name, so its link can't be guessed.
import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

export const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" } as const;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");
const BLOB_HOST = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//;

export async function saveImage(file: File) {
  const extension = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
  const name = `${crypto.randomUUID()}.${extension}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`images/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** True for a link this app made: a Blob link, or a local /uploads/ file. */
export const isOurImage = (url: string) => BLOB_HOST.test(url) || /^\/uploads\/[\w-]+\.(jpg|png|webp|gif)$/.test(url);

export async function deleteImage(url: string | undefined) {
  if (!url) return;
  try {
    if (BLOB_HOST.test(url)) await del(url);
    else if (isOurImage(url)) await fs.rm(path.join(LOCAL_DIR, path.basename(url)), { force: true });
  } catch {
    // An old picture that can't be removed is not worth failing for.
  }
}
