import { logOut } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { CoinFan } from "@/components/coin-fan";

export function AdminHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-line px-6 py-4">
      <span className="me-auto flex min-h-11 items-center gap-2">
        <CoinFan theme="light" className="h-6 w-9" />
        <span className="text-wordmark-sm text-text-accent">juno</span>
        <span className="rounded-full bg-radiant px-2.5 py-1 text-body-2-medium text-dark-green">Team</span>
      </span>
      <form action={logOut}>
        <Button type="submit" variant="secondary" className="h-11 rounded-full px-4 shadow-none">Log out</Button>
      </form>
    </header>
  );
}
