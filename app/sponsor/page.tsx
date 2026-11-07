// A sponsor's home. For now: her account and wallet are ready, and the next steps of the
// sponsor flow (fund, choose who to sponsor, set a budget) come next.
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logOut } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";
import { PageSpinner } from "@/components/page-spinner";
import { WalletBalance } from "@/components/wallet-balance";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sponsor · juno" };

const next = ["Fund your wallet", "Choose who to sponsor", "Set her budget"];

export default function Sponsor() {
  return (
    <div className="app-light min-h-dvh bg-background-full text-text-primary">
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
        <Link href="/" aria-label="juno home" className="me-auto flex min-h-11 items-center gap-2">
          <CoinFan theme="light" className="h-7 w-10" />
          <span className="text-wordmark-sm text-text-accent">juno</span>
        </Link>
        <form action={logOut}>
          <Button type="submit" variant="secondary" className="h-11 rounded-full px-5 shadow-none">Log out</Button>
        </form>
      </header>
      <Suspense fallback={<PageSpinner />}>
        <Home />
      </Suspense>
    </div>
  );
}

async function Home() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "sponsor") redirect("/app");

  return (
    <main className="mx-auto flex max-w-120 flex-col gap-6 px-6 py-8">
      <h1 className="text-title-1-medium tracking-[-0.03em]">Welcome, {user.name.split(" ")[0]}.</h1>
      <div className="on-dark flex flex-col gap-1 rounded-2xl bg-green p-5">
        <span className="text-body-2-regular text-text-tertiary">Your wallet</span>
        <Suspense fallback={<span className="h-9" aria-label="Loading balance" />}>
          <WalletBalance address={user.wallet?.publicKey} className="text-display-4-medium tracking-[-0.03em] text-radiant" />
        </Suspense>
      </div>
      <section aria-labelledby="next" className="flex flex-col gap-3">
        <h2 id="next" className="text-title-3-medium">Coming next</h2>
        <ol className="flex flex-col overflow-hidden rounded-2xl border border-line">
          {next.map((step, index) => (
            <li key={step} className="flex min-h-14 items-center gap-3 border-b border-line px-5 text-body-regular last:border-b-0">
              <span className="flex size-7 items-center justify-center rounded-full bg-mint text-body-2-medium text-green">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
