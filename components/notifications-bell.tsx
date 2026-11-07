"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Dialog, DialogTrigger, Heading, Popover } from "react-aria-components";
import { RiArrowRightUpLine, RiNotification3Line } from "@remixicon/react";
import { loadBell, markBellSeen, type Bell } from "@/app/notifications";
import { explorer } from "@/lib/constants";
import { cx } from "@/utils/cx";

const dots = { paid: "bg-neon", funded: "bg-radiant", skill: "bg-purple", info: "bg-text-tertiary" } as const;

function ago(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units: [number, Intl.RelativeTimeFormatUnit][] = [[60, "minute"], [3600, "hour"], [86400, "day"]];
  const [size, unit] = seconds < 3600 ? units[0] : seconds < 86400 ? units[1] : units[2];
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-Math.floor(seconds / size), unit);
}

/** The bell: activity like funding, payments, skills and certificates, newest first. */
export function NotificationsBell({ initial }: { initial: Bell }) {
  const [bell, setBell] = useState(initial);
  const [open, setOpen] = useState(false);

  const fresh = bell.notes.filter((note) => !bell.seenAt || note.at > bell.seenAt);

  // Check for news now and then while the page is open.
  useEffect(() => {
    const timer = setInterval(() => loadBell().then(setBell).catch(() => {}), 45_000);
    return () => clearInterval(timer);
  }, []);

  async function toggle(next: boolean) {
    setOpen(next);
    if (next) {
      setBell(await loadBell().catch(() => bell)); // the latest, right as she opens it
    } else if (fresh.length) {
      await markBellSeen().catch(() => {});
      setBell((current) => ({ ...current, seenAt: new Date().toISOString() }));
    }
  }

  return (
    <DialogTrigger isOpen={open} onOpenChange={toggle}>
      <Button
        aria-label={fresh.length ? `Notifications, ${fresh.length} new` : "Notifications"}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-separator-border outline-none hover:border-text-tertiary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <RiNotification3Line className="size-[18px]" aria-hidden />
        {fresh.length > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-green px-1 text-caption-2-medium text-radiant" aria-hidden>
            {fresh.length > 9 ? "9+" : fresh.length}
          </span>
        )}
      </Button>
      <Popover placement="bottom end" offset={8} className="app-light w-88 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white text-text-primary shadow-xl">
        <Dialog aria-label="Notifications" className="flex max-h-[min(30rem,70dvh)] flex-col outline-none">
          <Heading slot="title" className="border-b border-line px-5 py-4 text-title-3-medium">Notifications</Heading>
          {bell.notes.length ? (
            <ul className="flex flex-col overflow-y-auto overscroll-contain">
              {bell.notes.map((note) => {
                const isNew = !bell.seenAt || note.at > bell.seenAt;
                return (
                  <li key={note.id} className={cx("flex gap-3 border-b border-line px-5 py-3.5 last:border-b-0", isNew && "bg-mint")}>
                    <span className={cx("mt-1.5 size-2.5 shrink-0 rounded-full", dots[note.kind])} aria-hidden />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-body-medium">{note.title}</span>
                      <span className="text-body-regular text-text-secondary">{note.text}</span>
                      <span className="flex flex-wrap items-center gap-x-3 text-body-2-regular text-text-tertiary">
                        <time dateTime={note.at}>{ago(note.at)}</time>
                        {note.href && (
                          <Link href={note.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-green underline">
                            Open
                          </Link>
                        )}
                        {note.tx && (
                          <a href={explorer.tx(note.tx)} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-0.5 text-green underline">
                            View on Stellar
                            <RiArrowRightUpLine className="size-3.5" aria-hidden />
                          </a>
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-body-regular text-text-secondary">Nothing yet. Updates about your wallet and your learning will show up here.</p>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
