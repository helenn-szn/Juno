"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { RiArrowRightUpLine, RiArrowUpLine, RiPlayCircleLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Spinner } from "@/components/base/spinner/spinner";
import { touchInput } from "@/components/touch-input";
import { MENTOR_REVIEW_PRICE, explorer } from "@/lib/constants";
import type { Payment } from "@/lib/x402";

const GREETING = "Hi! Tell me where you're stuck and I'll find free help first.";

const problems = {
  setup: "Wallets aren't set up yet. Try again in a moment.",
  "low-balance": "Your wallet is running low. Ask your sponsor for a top-up?",
  failed: "That didn't go through, and you weren't charged. Try again?",
};

const bubble = "max-w-[90%] whitespace-pre-line rounded-[16px_16px_16px_4px] bg-dark-green px-3.5 py-3 text-copy-sm";

/** A free video the agent found. */
function Resource({ title, url }: { title: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-14 items-center gap-3 rounded-2xl bg-dark-green px-3.5 py-2.5 outline-none hover:bg-dark-green/70 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
    >
      <RiPlayCircleLine className="size-6 shrink-0 text-radiant" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-medium">{title}</span>
        <span className="text-body-2-regular text-text-tertiary">Free video</span>
      </span>
      <RiArrowRightUpLine className="size-5 shrink-0 text-text-tertiary" aria-hidden />
    </a>
  );
}

/** The offer for a paid mentor review. Nothing is paid until she taps Book review. */
function Offer({ reason }: { reason: string }) {
  const [state, setState] = useState<"asking" | "paying" | "declined" | Payment>("asking");

  async function book() {
    setState("paying");
    const res = await fetch("/api/pay", { method: "POST" }).catch(() => null);
    setState((await res?.json().catch(() => null)) ?? { ok: false, reason: "failed" });
  }

  if (state === "declined") return <p className={bubble}>No problem. I&apos;m here whenever you want a mentor.</p>;

  if (typeof state === "object" && state.ok) {
    return (
      <a
        href={explorer.tx(state.transaction)}
        target="_blank"
        rel="noreferrer"
        aria-live="polite"
        className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-neon px-4 py-2.5 text-body-medium text-dark-green outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        {state.review.message}
        <span className="sr-only">View on Stellar</span>
        <RiArrowRightUpLine className="size-5 shrink-0" aria-hidden />
      </a>
    );
  }

  const paying = state === "paying";
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-dark-green p-4">
      <p className="text-copy-sm">
        {reason} A mentor review costs {MENTOR_REVIEW_PRICE} USDC from your wallet. Book it?
      </p>
      <div className="flex gap-2">
        <Button onClick={book} disabled={paying} className="h-11 flex-1 rounded-full shadow-none">
          {paying ? "Paying mentor…" : typeof state === "object" ? "Try again" : "Book review"}
        </Button>
        <Button variant="secondary" onClick={() => setState("declined")} disabled={paying} className="h-11 flex-1 rounded-full border-radiant bg-transparent text-radiant shadow-none">
          Not now
        </Button>
      </div>
      <div aria-live="polite">
        {paying && (
          <div className="flex items-center gap-2 text-body-regular text-text-secondary">
            <Spinner size="sm" aria-label="Paying" /> This can take up to a minute.
          </div>
        )}
        {typeof state === "object" && !state.ok && <p className="text-body-regular text-text-error-primary">{problems[state.reason]}</p>}
      </div>
    </div>
  );
}

export function StudyAgent({ course, stuckOn }: { course: string; stuckOn: string }) {
  const [draft, setDraft] = useState("");
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/study-agent", body: { course } }));
  const { messages, sendMessage, status, error } = useChat({ transport });
  const end = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";
  const thinking = status === "submitted";

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, thinking, error]);

  function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    sendMessage({ text: question });
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5">
      <div role="log" aria-live="polite" aria-label="Study agent" className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain">
        <p className={bubble}>{GREETING}</p>
        {messages.map((message) =>
          message.role === "user" ? (
            <p key={message.id} className="max-w-[85%] self-end whitespace-pre-line rounded-[16px_16px_4px_16px] bg-radiant px-3.5 py-3 text-copy-sm text-dark-green">
              {message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
            </p>
          ) : (
            <div key={message.id} className="flex flex-col gap-2">
              {message.parts.map((part, index) => {
                if (part.type === "text") return part.text ? <p key={index} className={bubble}>{part.text}</p> : null;
                if (part.type === "tool-suggestFreeResource" && part.state === "output-available") {
                  return <Resource key={index} {...(part.output as { title: string; url: string })} />;
                }
                if (part.type === "tool-offerPaidHelp" && part.state === "output-available") {
                  return <Offer key={index} reason={(part.output as { reason: string }).reason} />;
                }
                return null;
              })}
            </div>
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-2 text-body-regular text-text-secondary">
            <Spinner size="sm" aria-label="Your study agent is thinking" />
            Thinking…
          </div>
        )}
        {error && (
          <p className="text-body-regular text-text-error-primary">
            {error.message === "busy" ? "Your study agent is busy, try again in a moment." : "Your study agent couldn't answer that. Try again?"}
          </p>
        )}
        <div ref={end} />
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {[`I'm stuck on ${stuckOn}`, "Explain this module simply"].map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => ask(text)}
              className="min-h-11 rounded-full border border-radiant px-3 text-body-2-regular text-radiant outline-none hover:bg-radiant/10 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
        className="flex items-center gap-2"
      >
        <Input
          aria-label="Message your study agent"
          placeholder="Where are you stuck?"
          value={draft}
          onChange={setDraft}
          autoComplete="off"
          className="flex-1"
          {...touchInput}
          fieldClassName="rounded-full bg-dark-green px-3.5 py-0 border border-separator-border"
        />
        <Button type="submit" iconOnly leadingIcon={RiArrowUpLine} aria-label="Send" disabled={busy || !draft.trim()} className="size-11 shrink-0 rounded-full p-0 shadow-none" />
      </form>
    </div>
  );
}
