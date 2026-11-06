import { usdcBalanceOrZero } from "@/lib/stellar";

/** Her balance, read from Stellar. Show it inside a <Suspense>. */
export async function WalletBalance({ address, className }: { address?: string; className?: string }) {
  const balance = address ? await usdcBalanceOrZero(address) : 0;
  return (
    <span className={className}>
      {balance.toFixed(2)} <span className="text-headline-regular">USDC</span>
    </span>
  );
}
