"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiAwardLine,
  RiCheckLine,
  RiInboxLine,
  RiPriceTag3Line,
  RiTimeLine,
  RiUserLine,
  RiBookOpenLine,
  RiGroupLine,
  RiLayoutGridLine,
  RiListCheck,
  RiPlayCircleLine,
  RiSettings3Line,
  RiWalletLine,
} from "@remixicon/react";
import { cx } from "@/utils/cx";

type Item = { href: string; label: string; short?: string; icon: typeof RiLayoutGridLine; exact?: boolean };

// A sponsor's menu. The first three jump to a part of the Overview page.
const sponsorItems: Item[] = [
  { href: "/sponsor", label: "Overview", icon: RiLayoutGridLine, exact: true },
  { href: "/sponsor#learners", label: "Learners", icon: RiGroupLine },
  { href: "/sponsor#seats", label: "Course seats", short: "Seats", icon: RiBookOpenLine },
  { href: "/sponsor#payments", label: "Payments", icon: RiListCheck },
  { href: "/sponsor/fund", label: "Wallet", icon: RiWalletLine },
];

// A mentor's menu. The middle ones jump to a part of the Requests page.
const mentorItems: Item[] = [
  { href: "/app", label: "Requests", icon: RiInboxLine, exact: true },
  { href: "/app#progress", label: "In progress", short: "Progress", icon: RiTimeLine },
  { href: "/app#done", label: "Reviews done", short: "Done", icon: RiCheckLine },
  { href: "/app#earnings", label: "Earnings", icon: RiWalletLine },
  { href: "/app/prices", label: "Prices", icon: RiPriceTag3Line },
  { href: "/app/profile", label: "Profile", icon: RiUserLine },
];

type Role = "learner" | "sponsor" | "mentor";

const learnerItems: Item[] = [
  { href: "/app", label: "Dashboard", icon: RiLayoutGridLine, exact: true },
  { href: "/app/courses", label: "Courses", icon: RiBookOpenLine },
  { href: "/app/learning", label: "My learning", short: "Learning", icon: RiPlayCircleLine },
  { href: "/app/certificates", label: "Certificates", short: "Certificates", icon: RiAwardLine },
  { href: "/app/wallet", label: "Wallet", icon: RiWalletLine },
  { href: "/app/settings", label: "Settings", icon: RiSettings3Line },
];

function useNav(role: Role) {
  const pathname = usePathname();
  // A link to a part of a page (with a #) is never "current"; the page's own link is.
  const active = (item: Item) => (item.exact ? pathname === item.href : !item.href.includes("#") && pathname.startsWith(item.href));
  return { items: role === "sponsor" ? sponsorItems : role === "mentor" ? mentorItems : learnerItems, active };
}

const ring = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

/** The left sidebar links, on desktop. */
export function SidebarLinks({ role = "learner", badge = 0 }: { role?: Role; badge?: number }) {
  const { items, active } = useNav(role);
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active(item) ? "page" : undefined}
          className={cx(
            "flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-body-medium",
            ring,
            active(item) ? "bg-green text-radiant" : "text-text-primary hover:bg-mint",
          )}
        >
          <item.icon className="size-[18px]" aria-hidden />
          <span className="flex-1">{item.label}</span>
          {item.label === "Requests" && badge > 0 && (
            <span className="rounded-full bg-radiant px-2 py-0.5 text-body-2-medium text-dark-green">
              {badge}
              <span className="sr-only"> new</span>
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

/** The bottom tab bar, on phones. */
export function TabBar({ role = "learner", badge = 0 }: { role?: Role; badge?: number }) {
  const { items, active } = useNav(role);
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-background-full pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active(item) ? "page" : undefined}
          className={cx(
            "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] leading-3",
            ring,
            active(item) ? "text-green" : "text-text-secondary",
          )}
        >
          <span className="relative">
            <item.icon className="size-5" aria-hidden />
            {item.label === "Requests" && badge > 0 && (
              <span className="absolute -end-2.5 -top-1.5 rounded-full bg-radiant px-1.5 text-[10px] leading-4 text-dark-green">{badge}</span>
            )}
          </span>
          <span className="max-w-full truncate">{item.short ?? item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
