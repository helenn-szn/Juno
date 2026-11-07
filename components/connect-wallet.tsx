"use client";

import { useSyncExternalStore } from "react";
import { RiFileCopyLine, RiLinkUnlinkM, RiWalletLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Dropdown, DropdownItem, DropdownPopover, DropdownTrigger } from "@/components/base/dropdown/dropdown";

// Lets a person link a Stellar wallet they already own (Freighter, xBull, Lobstr and more), on the
// test network. The wallet Juno made at sign-up stays her default. We only ever see the PUBLIC
// address, never a secret key: the wallet itself keeps the keys and does any signing.
const KEY = "juno-connected-wallet";

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("juno-wallet", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("juno-wallet", onChange);
  };
}
function write(address: string | null) {
  try {
    if (address) localStorage.setItem(KEY, address);
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event("juno-wallet"));
}

// The wallet kit touches the browser, so it is only loaded when someone taps the button.
async function loadKit() {
  const [{ StellarWalletsKit }, { defaultModules }, { Networks }] = await Promise.all([
    import("@creit.tech/stellar-wallets-kit/sdk"),
    import("@creit.tech/stellar-wallets-kit/modules/utils"),
    import("@creit.tech/stellar-wallets-kit/types"),
  ]);
  StellarWalletsKit.init({ modules: defaultModules(), network: Networks.TESTNET });
  return StellarWalletsKit;
}

export const shortAddress = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;

/** The dark green "Connect wallet" button in every dashboard header. */
export function ConnectWallet() {
  const address = useSyncExternalStore(subscribe, read, () => null);

  async function connect() {
    try {
      const kit = await loadKit();
      const { address: connected } = await kit.authModal();
      write(connected);
    } catch {
      // She closed the window without choosing a wallet. Nothing to do.
    }
  }

  async function disconnect() {
    try {
      await (await loadKit()).disconnect();
    } catch {}
    write(null);
  }

  if (!address) {
    return (
      <Button onClick={connect} leadingIcon={RiWalletLine} className="h-11 rounded-full bg-green px-4 text-mint shadow-none [background-image:none] hover:bg-green/85 max-sm:w-11 max-sm:px-0" aria-label="Connect wallet">
        <span className="max-sm:sr-only">Connect wallet</span>
      </Button>
    );
  }
  return (
    <Dropdown>
      <DropdownTrigger
        aria-label={`Connected wallet ${address}`}
        className="flex h-11 items-center gap-2 rounded-full bg-green px-4 text-body-medium text-mint outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <RiWalletLine className="size-[18px]" aria-hidden />
        <span className="max-sm:sr-only font-mono text-body-2-medium">{shortAddress(address)}</span>
      </DropdownTrigger>
      <DropdownPopover aria-label="Connected wallet" placement="bottom end" className="w-60">
        <div className="flex flex-col px-2 py-1.5">
          <span className="text-body-2-regular text-text-tertiary">Connected on testnet</span>
          <span className="font-mono text-body-2-medium">{shortAddress(address)}</span>
        </div>
        <DropdownItem onSelect={() => navigator.clipboard?.writeText(address).catch(() => {})} className="min-h-11 px-2">
          <RiFileCopyLine className="size-5" aria-hidden />
          Copy address
        </DropdownItem>
        <DropdownItem onSelect={disconnect} className="min-h-11 px-2">
          <RiLinkUnlinkM className="size-5" aria-hidden />
          Disconnect
        </DropdownItem>
      </DropdownPopover>
    </Dropdown>
  );
}
