"use client";

import { RiLogoutBoxRLine } from "@remixicon/react";
import { logOut } from "@/app/actions";
import { Dropdown, DropdownItem, DropdownPopover, DropdownTrigger } from "@/components/base/dropdown/dropdown";

/** The round account button in the top bar: who she is, and Log out. */
export function AccountMenu({ name, email }: { name: string; email: string }) {
  return (
    <Dropdown>
      <DropdownTrigger
        aria-label="Your account"
        className="flex size-11 items-center justify-center rounded-full bg-purple text-headline-medium text-dark-green"
      >
        {name.charAt(0).toUpperCase()}
      </DropdownTrigger>
      <DropdownPopover aria-label="Your account" placement="bottom end" className="w-64">
        <div className="flex flex-col px-2 py-1.5">
          <span className="truncate text-body-medium text-text-primary">{name}</span>
          <span className="truncate text-body-2-regular text-text-tertiary">{email}</span>
        </div>
        <DropdownItem onSelect={() => logOut()} className="min-h-11 px-2">
          <RiLogoutBoxRLine className="size-5" aria-hidden />
          Log out
        </DropdownItem>
      </DropdownPopover>
    </Dropdown>
  );
}
