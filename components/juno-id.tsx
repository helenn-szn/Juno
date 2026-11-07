"use client";

import { useState } from "react";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { cx } from "@/utils/cx";

/** Her Juno ID in a mono font, with a button that copies it. Safe to share: it reveals nothing private. */
export function JunoId({ id, className }: { id: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={cx("flex items-center gap-2 ps-4 pe-1", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-caption-1-regular text-text-tertiary">Your Juno ID</span>
        <span className="font-mono text-copy tracking-[0.06em]">{id}</span>
      </div>
      <button
        type="button"
        aria-label={copied ? "Juno ID copied" : "Copy your Juno ID"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Copy your Juno ID", id);
          }
        }}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-separator-border outline-none hover:border-text-tertiary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        {copied ? <RiCheckLine className="size-[18px]" aria-hidden /> : <RiFileCopyLine className="size-[18px]" aria-hidden />}
      </button>
    </div>
  );
}
