"use client";

import { useEffect, useRef, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { cx } from "@/utils/cx";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it's for" },
  { href: "#work", label: "Skills to work" },
];

// The landing header. Above 760px the links sit in a row. Below, they fold into
// a menu button that opens a full-width menu under the header.
export function LandingHeader({ appHref }: { appHref: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="mx-auto flex max-w-312 flex-wrap items-center justify-between gap-4 px-6 py-5">
      <a href="#top" className="flex min-h-11 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <CoinFan className="h-8 w-11.5" />
        <span className="text-wordmark text-text-accent">juno</span>
      </a>
      <nav aria-label="Main" className="flex flex-wrap items-center gap-6 text-copy-sm max-[760px]:hidden">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="hover:text-text-accent">{link.label}</a>
        ))}
        <ButtonLink href={appHref} className="h-11 rounded-full px-4.5 text-copy-sm font-medium shadow-none">
          Get started
        </ButtonLink>
      </nav>
      <button
        ref={button}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex size-12 items-center justify-center rounded-xl border border-separator-border outline-none hover:border-text-tertiary focus-visible:ring-2 focus-visible:ring-border-focus-ring min-[761px]:hidden"
      >
        {open ? <RiCloseLine className="size-6" aria-hidden /> : <RiMenuLine className="size-6" aria-hidden />}
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="flex w-full flex-col gap-1 border-t border-separator-border pt-2 pb-4 min-[761px]:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cx("flex min-h-13 items-center border-b border-line text-lead-sm outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring")}
            >
              {link.label}
            </a>
          ))}
          <ButtonLink href={appHref} className="mt-3 h-13 w-full rounded-full text-cta shadow-none">
            Get started
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
