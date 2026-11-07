"use client";

import type { Dispatch, SetStateAction } from "react";
import { RiChat1Line, RiMicLine, RiVideoChatLine } from "@remixicon/react";
import { FORMATS, FORMAT_KEYS, type Format } from "@/lib/mentors-shared";
import { cx } from "@/utils/cx";

const icons = {
  written: RiChat1Line,
  voice: RiMicLine,
  call: RiVideoChatLine,
} as const;
export const tints = {
  written: "bg-radiant",
  voice: "bg-neon",
  call: "bg-purple",
} as const;

/** One row per format: icon, allowed range, price and an on/off switch. A price out of range shows the error style. */
export function PriceRows({
  offer,
  setOffer,
  price,
  setPrice,
  problems,
}: {
  offer: Record<Format, boolean>;
  setOffer: Dispatch<SetStateAction<Record<Format, boolean>>>;
  price: Record<Format, string>;
  setPrice: Dispatch<SetStateAction<Record<Format, string>>>;
  problems: Record<string, string | undefined>;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line">
      {FORMAT_KEYS.map((format) => {
        const Icon = icons[format];
        const problem = problems[format];
        return (
          <div
            key={format}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line px-4 py-3.5 last:border-b-0"
          >
            <span
              className={cx(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                tints[format],
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="flex min-w-0 grow basis-40 flex-col gap-0.5">
              <span className="text-body-medium">{FORMATS[format].label}</span>
              <span
                id={`hint-${format}`}
                className={cx(
                  "text-body-2-regular",
                  problem ? "text-field-error" : "text-text-secondary",
                )}
              >
                {problem ??
                  `Set your price: ${FORMATS[format].min.toFixed(2)} to ${FORMATS[format].max} USDC`}
              </span>
            </div>
            <label className="flex items-center gap-2 text-copy-sm">
              <span className="sr-only">
                Price for {FORMATS[format].label.toLowerCase()}
              </span>
              <input
                name={`price_${format}`}
                type="text"
                inputMode="decimal"
                placeholder={`${FORMATS[format].min}–${FORMATS[format].max}`}
                value={price[format]}
                onChange={(event) =>
                  setPrice((p) => ({ ...p, [format]: event.target.value }))
                }
                disabled={!offer[format]}
                aria-invalid={problem ? true : undefined}
                aria-describedby={`hint-${format}`}
                className="w-22 text-end"
              />
              USDC
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={offer[format]}
              aria-label={`Offer ${FORMATS[format].label.toLowerCase()}`}
              onClick={() => setOffer((o) => ({ ...o, [format]: !o[format] }))}
              className={cx(
                "relative h-6.5 w-11 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                offer[format] ? "bg-green" : "bg-field-border",
              )}
            >
              <span
                className={cx(
                  "absolute top-0.75 size-5 rounded-full transition-all",
                  offer[format] ? "end-0.75 bg-radiant" : "start-0.75 bg-white",
                )}
              />
            </button>
            {offer[format] && (
              <input type="hidden" name={`offer_${format}`} value="on" />
            )}
          </div>
        );
      })}
    </div>
  );
}
