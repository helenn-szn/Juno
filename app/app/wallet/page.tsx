// Her learning wallet: the balance, and a link to see it on the Stellar explorer.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { WalletBalance } from "@/components/wallet-balance";
import { explorer } from "@/lib/constants";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Wallet · juno" };

export default function Wallet() {
  return (
    <>
      <TopBar title="Wallet" />
      <Suspense fallback={<PageSpinner />}>
        <Balance />
      </Suspense>
    </>
  );
}

async function Balance() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const address = user.wallet?.publicKey;

  return (
    <div className="flex max-w-120 flex-col gap-4 p-6 lg:p-7">
      <div className="on-dark flex flex-col gap-1 rounded-2xl bg-green p-5">
        <span className="text-body-2-regular text-text-tertiary">Learning wallet</span>
        <Suspense fallback={<span className="h-9" aria-label="Loading balance" />}>
          <WalletBalance address={address} className="text-display-4-medium tracking-[-0.03em] text-radiant" />
        </Suspense>
      </div>
      {address ? (
        <a
          href={explorer.account(address)}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center self-start rounded-lg text-body-medium text-coin-newest-side underline outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          See your wallet on Stellar
        </a>
      ) : (
        <p className="text-body-regular text-text-secondary">Your wallet is being set up. Check back in a moment.</p>
      )}
    </div>
  );
}
