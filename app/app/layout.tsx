import { Suspense } from "react";
import { SidebarLinks, TabBar } from "@/components/app-nav";
import { CoinFan } from "@/components/coin-fan";
import { JunoChat } from "@/components/juno-chat";
import { currentUser } from "@/lib/session";
import { StallionCard } from "@/components/stallion-card";
import Link from "next/link";

// The frame around every app screen: sidebar on desktop, tab bar on phones,
// and Juno.ai in the corner.
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="app-light flex min-h-dvh bg-background-full text-text-primary">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-7 border-e border-line px-4 py-6 lg:flex">
        <Link href="/app" className="flex min-h-11 items-center gap-2 rounded-lg px-2 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
          <CoinFan theme="light" className="h-7 w-10" />
          <span className="text-wordmark-sm text-text-accent">juno</span>
        </Link>
        <Suspense>
          <SidebarLinks />
        </Suspense>
        <StallionCard className="mt-auto" />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
        <StallionCard className="mx-6 mb-6 lg:hidden" />
      </main>

      <Suspense>
        <TabBar />
        <Chat />
      </Suspense>
    </div>
  );
}

// Juno.ai knows whether she has set up her plan yet; it asks the questions if she hasn't.
async function Chat() {
  const user = await currentUser();
  return <JunoChat hasProfile={Boolean(user?.profile)} />;
}
