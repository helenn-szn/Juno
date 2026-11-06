// Runs in the browser: shrinks a photo before it is sent, so uploads are quick on
// a phone connection and always under the 4 MB limit.
export async function shrinkImage(file: File, maxSize: number): Promise<File> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.85));
  if (!blob) throw new Error("shrink-failed");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

/** Uploads an image and returns its link. */
export async function uploadImage(file: File, kind: "chat" | "avatar") {
  const body = new FormData();
  body.append("file", await shrinkImage(file, kind === "avatar" ? 512 : 1600));
  body.append("kind", kind);
  const response = await fetch("/api/upload", { method: "POST", body });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? "failed");
  return (await response.json()).url as string;
}
