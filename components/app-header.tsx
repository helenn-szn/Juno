import Link from "next/link";
import { logOut } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/app" className="flex min-h-11 items-center gap-1.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <CoinFan className="h-6 w-8.5" />
        <span className="text-title-3-medium text-text-accent">juno</span>
      </Link>
      <form action={logOut}>
        <Button type="submit" variant="secondary" className="h-11 rounded-full px-4 shadow-none">
          Log out
        </Button>
      </form>
    </header>
  );
}
