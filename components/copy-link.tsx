"use client";

import { useState } from "react";
import { RiCheckLine, RiLinkM } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";

/** Copies a link to the clipboard and says so. */
export function CopyLink({ url, children }: { url: string; children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      leadingIcon={copied ? RiCheckLine : RiLinkM}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this link", url);
        }
      }}
      className="h-11 rounded-full px-5 shadow-none"
    >
      <span aria-live="polite">{copied ? "Link copied" : children}</span>
    </Button>
  );
}
