"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RiCameraLine } from "@remixicon/react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/base/buttons/button";
import { uploadImage } from "@/lib/upload-client";

/** Settings: her profile picture and the button that changes it. */
export function AvatarUpload({ name, src }: { name: string; src?: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function choose(file: File | undefined) {
    if (!file) return;
    setState("saving");
    try {
      await uploadImage(file, "avatar");
      setState("idle");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={src} className="size-20 text-title-1-medium" />
      <div className="flex flex-col items-start gap-1.5">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose a profile picture"
          hidden
          onChange={(event) => {
            choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          leadingIcon={RiCameraLine}
          disabled={state === "saving"}
          onClick={() => input.current?.click()}
          className="h-11 rounded-full px-5 shadow-none"
        >
          {state === "saving" ? "Saving…" : src ? "Change photo" : "Add a photo"}
        </Button>
        {state === "error" && <p role="alert" className="text-body-2-regular text-text-error-primary">That didn&apos;t upload. Try another photo?</p>}
      </div>
    </div>
  );
}
