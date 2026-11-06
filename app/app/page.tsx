import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CoinFan } from "@/components/coin-fan";
import { MentorReview } from "@/components/mentor-review";
import { explorer } from "@/lib/constants";
import { usdcBalance, wallet } from "@/lib/stellar";

const people = [
  { name: "Ada", role: "learner" },
  { name: "Mentor", role: "mentor" },
] as const;

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col p-6">
      <Link href="/" className="flex items-center gap-1.5 self-start rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <CoinFan className="h-6 w-8.5" />
        <span className="text-title-3-medium text-text-accent">juno</span>
      </Link>
      <div className="m-auto flex w-full max-w-sm flex-col gap-4 py-12">
        <ul className="divide-y divide-separator-border overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
          <Suspense fallback={people.map((p) => <Row key={p.role} name={p.name} />)}>
            <Balances />
          </Suspense>
        </ul>
        <MentorReview />
      </div>
    </main>
  );
}

async function Balances() {
  await connection(); // fresh from Stellar on every visit
  return Promise.all(
    people.map(async ({ name, role }) => {
      const address = wallet(role)?.publicKey();
      const balance = address ? await usdcBalance(address) : undefined;
      return <Row key={role} name={name} balance={balance} href={address && explorer.account(address)} />;
    }),
  );
}

function Row({ name, balance, href }: { name: string; balance?: number; href?: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between px-5 py-4 outline-none hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus-ring"
      >
        <span className="text-body-regular text-text-secondary">{name}</span>
        <span className="text-headline-medium tabular-nums">
          {balance === undefined ? "—" : balance.toFixed(2)}
          <span className="text-text-tertiary"> USDC</span>
        </span>
      </a>
    </li>
  );
}
