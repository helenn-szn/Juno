"use client";

import { RiLogoutBoxRLine } from "@remixicon/react";
import { logOut } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { Dropdown, DropdownItem, DropdownPopover, DropdownTrigger } from "@/components/base/dropdown/dropdown";

/** The round account button in the top bar: who she is, and Log out. */
export function AccountMenu({ name, email, avatar }: { name: string; email: string; avatar?: string }) {
  return (
    <Dropdown>
      <DropdownTrigger
        aria-label="Your account"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <Avatar name={name} src={avatar} className="size-11" />
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
