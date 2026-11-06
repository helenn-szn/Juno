// POST /api/upload  (multipart: file, and kind = "chat" | "avatar")  →  { url }
// Signed-in learners only. An avatar also becomes her profile picture.
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, deleteImage, saveImage } from "@/lib/uploads";
import { updateUser } from "@/lib/users";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "signed-out" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !(file.type in IMAGE_TYPES)) {
    return NextResponse.json({ error: "not-an-image" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "too-big" }, { status: 413 });

  const url = await saveImage(file).catch(() => null);
  if (!url) return NextResponse.json({ error: "failed" }, { status: 500 });

  if (form?.get("kind") === "avatar") {
    await updateUser(user.id, (current) => ({ ...current, avatar: url }));
    await deleteImage(user.avatar);
  }
  return NextResponse.json({ url });
}
