"use client";

import { useState } from "react";

/** Copies a pending learner's invite link so the sponsor can send it again. */
export function CopyInvite({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const link = `${window.location.origin}/signup?invite=${token}`;
        try {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this invite link", link);
        }
      }}
      className="flex min-h-11 w-32 items-center text-body-2-medium text-green underline outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      aria-live="polite"
    >
      {copied ? "Link copied" : "Copy invite link"}
    </button>
  );
}
