// Fund wallet: add testnet USDC to the sponsor's wallet, and see it on Stellar.
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RiArrowRightUpLine } from "@remixicon/react";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { topUp } from "@/app/sponsor/actions";
import { TopUp } from "@/components/sponsor-forms";
import { WalletBalance } from "@/components/wallet-balance";
import { explorer } from "@/lib/constants";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Fund wallet · juno" };

export default function Fund() {
  return (
    <>
      <TopBar title="Fund wallet" back={{ href: "/sponsor", label: "Back to overview" }} />
      <Suspense fallback={<PageSpinner />}>
        <Wallet />
      </Suspense>
    </>
  );
}

async function Wallet() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "sponsor") redirect("/app");
  const address = user.wallet?.publicKey;

  return (
    <div className="flex max-w-120 flex-col gap-6 p-6 lg:p-7">
      <div className="on-dark flex flex-col gap-1 rounded-2xl bg-green p-5">
        <span className="text-body-2-regular text-text-tertiary">Your wallet</span>
        <Suspense fallback={<span className="h-9" aria-label="Loading balance" />}>
          <WalletBalance address={address} className="text-display-4-medium tracking-[-0.03em] text-radiant" />
        </Suspense>
      </div>
      {address ? (
        <>
          <section aria-labelledby="add" className="flex flex-col gap-3">
            <h2 id="add" className="text-title-3-medium">Add test USDC</h2>
            <p className="text-body-regular text-text-secondary">On the test network this is free play money: we swap some of your wallet&apos;s free test XLM for USDC.</p>
            <TopUp action={topUp} amounts={[20, 50, 100]} />
          </section>
          <a href={explorer.account(address)} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-1 self-start text-body-medium text-coin-newest-side underline">
            See your wallet on Stellar
            <RiArrowRightUpLine className="size-4" aria-hidden />
          </a>
          <p className="text-body-2-regular text-text-secondary">
            Prefer Circle&apos;s faucet? Get test USDC at{" "}
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="underline">faucet.circle.com</a>, choose Stellar, and paste your address:
            <span className="mt-1 block break-all font-mono text-[11px]">{address}</span>
          </p>
        </>
      ) : (
        <p className="text-body-regular text-text-secondary">Your wallet is being set up. Check back in a moment.</p>
      )}
    </div>
  );
}
