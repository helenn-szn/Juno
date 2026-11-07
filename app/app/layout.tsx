import { Suspense } from "react";
import Link from "next/link";
import { SidebarLinks, TabBar } from "@/components/app-nav";
import { ButtonLink } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { JunoChat } from "@/components/juno-chat";
import { StallionCard } from "@/components/stallion-card";
import { requestsForMentor } from "@/lib/mentors";
import { currentUser } from "@/lib/session";
import { cx } from "@/utils/cx";

// A mentor's card where a learner has "Find work on Stallion".
function ShareCard({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-col gap-3 rounded-2xl bg-purple px-3 py-4 text-center text-dark-green", className)}>
      <p className="text-headline-medium">Show your impact</p>
      <ButtonLink href="/app/profile" className="h-11 w-full justify-center rounded-full bg-dark-green px-3 text-center text-mint shadow-none [background-image:none] hover:bg-dark-green/80">
        Share your profile
      </ButtonLink>
    </div>
  );
}

// The frame around every app screen: sidebar on desktop, tab bar on phones. Learners get Juno.ai in the
// corner; a mentor gets her own menu, even while her application is under review.
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="app-light flex min-h-dvh bg-background-full text-text-primary">
      <Suspense fallback={<main className="flex min-w-0 flex-1 flex-col">{children}</main>}>
        <Frame>{children}</Frame>
      </Suspense>
    </div>
  );
}

async function Frame({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const mentor = user?.role === "mentor";
  if (mentor && !user?.mentor) return <main className="flex min-w-0 flex-1 flex-col">{children}</main>;

  const role = mentor ? "mentor" : "learner";
  const badge = mentor && user ? (await requestsForMentor(user.id)).filter((r) => r.status === "requested").length : 0;
  const Card = mentor ? ShareCard : StallionCard;
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-7 border-e border-line px-4 py-6 lg:flex">
        <Link href="/app" className="flex min-h-11 items-center gap-2 rounded-lg px-2 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
          <CoinFan theme="light" className="h-7 w-10" />
          <span className="text-wordmark-sm text-text-accent">juno</span>
        </Link>
        <SidebarLinks role={role} badge={badge} />
        <Card className="mt-auto" />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
        <Card className="mx-6 mb-6 lg:hidden" />
      </main>

      <TabBar role={role} badge={badge} />
      {!mentor && <JunoChat hasProfile={Boolean(user?.profile)} />}
    </>
  );
}
