"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiAwardLine,
  RiBookOpenLine,
  RiLayoutGridLine,
  RiPlayCircleLine,
  RiSettings3Line,
  RiWalletLine,
} from "@remixicon/react";
import { cx } from "@/utils/cx";

const items = [
  { href: "/app", label: "Dashboard", icon: RiLayoutGridLine, exact: true },
  { href: "/app/courses", label: "Courses", icon: RiBookOpenLine },
  { href: "/app/learning", label: "My learning", short: "Learning", icon: RiPlayCircleLine },
  { href: "/app/certificates", label: "Certificates", short: "Certificates", icon: RiAwardLine },
  { href: "/app/wallet", label: "Wallet", icon: RiWalletLine },
  { href: "/app/settings", label: "Settings", icon: RiSettings3Line },
];

function useActive() {
  const pathname = usePathname();
  return (item: (typeof items)[number]) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
}

const ring = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

/** The left sidebar links, on desktop. */
export function SidebarLinks() {
  const active = useActive();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active(item) ? "page" : undefined}
          className={cx(
            "flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-body-medium hover:bg-green/60",
            ring,
            active(item) ? "bg-green text-radiant" : "text-mint",
          )}
        >
          <item.icon className="size-[18px]" aria-hidden />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** The bottom tab bar, on phones. */
export function TabBar() {
  const active = useActive();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-dark-green pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active(item) ? "page" : undefined}
          className={cx(
            "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] leading-3",
            ring,
            active(item) ? "text-radiant" : "text-text-secondary",
          )}
        >
          <item.icon className="size-5" aria-hidden />
          <span className="max-w-full truncate">{item.short ?? item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
