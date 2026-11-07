import { Suspense } from "react";
import Link from "next/link";
import { RiArrowLeftLine } from "@remixicon/react";
import { AccountMenu } from "@/components/account-menu";
import { NotificationsBell } from "@/components/notifications-bell";
import { ConnectWallet } from "@/components/connect-wallet";
import { CoinFan } from "@/components/coin-fan";
import { CourseSearch } from "@/components/course-search";
import { loadBell } from "@/app/notifications";
import { currentUser } from "@/lib/session";

async function Bell() {
  return <NotificationsBell initial={await loadBell()} />;
}

async function Account() {
  const user = await currentUser();
  return user ? <AccountMenu name={user.name} email={user.email} avatar={user.avatar} /> : null;
}

/**
 * The bar at the top of every app screen: a title (with a back button on
 * Course details), an optional course search, and her account menu.
 */
export function TopBar({ title, back, search = false }: { title: string; back?: { href: string; label: string }; search?: boolean }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-5 lg:px-7">
      {back ? (
        <Link
          href={back.href}
          aria-label={back.label}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line outline-none hover:border-text-tertiary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          <RiArrowLeftLine className="size-[18px]" aria-hidden />
        </Link>
      ) : (
        <Link href="/app" aria-label="juno home" className="flex min-h-11 items-center lg:hidden">
          <CoinFan theme="light" className="h-7 w-10" />
        </Link>
      )}
      <h1 className="me-auto min-w-0 truncate text-title-1-medium tracking-[-0.03em]">{title}</h1>
      {search && <CourseSearch className="order-last sm:order-none sm:w-75" />}
      <ConnectWallet />
      <Suspense fallback={<span className="size-11 rounded-full border border-separator-border" aria-hidden />}>
        <Bell />
      </Suspense>
      <Suspense fallback={<span className="size-11 rounded-full bg-purple" aria-hidden />}>
        <Account />
      </Suspense>
    </header>
  );
}
