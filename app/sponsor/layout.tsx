import { Suspense } from "react";
import Link from "next/link";
import { SidebarLinks, TabBar } from "@/components/app-nav";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { cx } from "@/utils/cx";

function SponsorCard({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-col gap-2.5 rounded-2xl bg-purple p-4.5 text-center text-dark-green", className)}>
      <p className="text-headline-medium">Back another woman</p>
      <ButtonLink href="/sponsor/invite" className="h-11 w-full justify-center rounded-full bg-dark-green px-4 text-center text-mint shadow-none [background-image:none] hover:bg-dark-green/80">
        Sponsor someone new
      </ButtonLink>
    </div>
  );
}

// The frame around a sponsor's screens: the same as the learner's, with her own menu.
export default function SponsorLayout({ children }: LayoutProps<"/sponsor">) {
  return (
    <div className="app-light flex min-h-dvh bg-background-full text-text-primary">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-7 border-e border-line px-4 py-6 lg:flex">
        <Link href="/sponsor" className="flex min-h-11 items-center gap-2 rounded-lg px-2 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
          <CoinFan theme="light" className="h-7 w-10" />
          <span className="text-wordmark-sm text-text-accent">juno</span>
        </Link>
        <Suspense>
          <SidebarLinks role="sponsor" />
        </Suspense>
        <SponsorCard className="mt-auto" />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
        <SponsorCard className="mx-6 mb-6 lg:hidden" />
      </main>

      <Suspense>
        <TabBar role="sponsor" />
      </Suspense>
    </div>
  );
}
