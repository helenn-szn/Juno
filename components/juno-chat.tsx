"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { RiArrowUpLine, RiCloseLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Spinner } from "@/components/base/spinner/spinner";
import { CourseRow } from "@/components/course-card";
import { touchInput } from "@/components/touch-input";
import { findCourse } from "@/lib/courses";
import { cx } from "@/utils/cx";

const transport = new DefaultChatTransport({ api: "/api/juno-ai" });
const GREETING = "Hello there, what can I help you with?";
const MARKER = /\[course:([a-z0-9-]+)\]/g;

function suggestions(pathname: string) {
  if (pathname.startsWith("/app/courses/build-ai-agents")) return ["Explain x402 simply", "What should I take next?"];
  if (pathname.startsWith("/app/courses/")) return ["What will I learn here?", "What should I take next?"];
  return ["Recommend a course", "How do mentor reviews work?"];
}

/** The little robot: Juno.ai's face. */
function Bot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <circle cx="24" cy="24" r="24" className="fill-radiant" />
      <line x1="24" y1="15" x2="24" y2="10" strokeWidth="2" className="stroke-dark-green" />
      <circle cx="24" cy="8.5" r="3" className="fill-purple" />
      <rect x="11" y="15" width="26" height="21" rx="7" className="fill-dark-green" />
      <circle cx="19" cy="25" r="3" className="fill-neon" />
      <circle cx="29" cy="25" r="3" className="fill-neon" />
      <path d="M20 31h8" strokeWidth="2" strokeLinecap="round" className="stroke-neon" />
    </svg>
  );
}

/** A reply, with each [course:slug] marker turned into a course card. */
function Reply({ text, onOpenCourse }: { text: string; onOpenCourse: () => void }) {
  const slugs = [...new Set([...text.matchAll(MARKER)].map((match) => match[1]))];
  const courses = slugs.flatMap((slug) => findCourse(slug) ?? []);
  // Hide a marker that is still being typed.
  const words = text.replace(MARKER, "").replace(/\[course:[^\]]*$/, "").trim();
  return (
    <div className="flex flex-col gap-2">
      {words && <p className="max-w-[90%] whitespace-pre-line rounded-[16px_16px_16px_4px] bg-dark-green px-3.5 py-3 text-copy-sm">{words}</p>}
      {courses.map((course) => (
        <CourseRow key={course.slug} course={course} onOpen={onOpenCourse} />
      ))}
    </div>
  );
}

export function JunoChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, status, error } = useChat({ transport });
  const launcher = useRef<HTMLButtonElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opened = useRef(false);

  const busy = status === "submitted" || status === "streaming";
  const lastText = messages.at(-1)?.parts.some((part) => part.type === "text" && part.text) ?? false;
  const thinking = status === "submitted" || (status === "streaming" && !lastText);

  // Focus moves into the chat when it opens and back to the button when it closes.
  useEffect(() => {
    if (open) {
      opened.current = true;
      input.current?.focus();
    } else if (opened.current) {
      launcher.current?.focus();
    }
  }, [open]);

  // Escape closes the chat from anywhere.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // On a phone the chat is a full-screen sheet, so the page behind it stays put.
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 1023px)").matches) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, [open]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages, thinking, error, open]);

  // On a phone the chat covers the screen, so opening a course closes it.
  function closeOnPhone() {
    if (window.matchMedia("(max-width: 1023px)").matches) setOpen(false);
  }

  function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    sendMessage({ text: question }, { body: { page: pathname } });
    setDraft("");
  }

  return (
    <>
      <button
        ref={launcher}
        type="button"
        hidden={open}
        onClick={() => setOpen(true)}
        aria-label="Open Juno.ai"
        className="fixed right-4 bottom-20 z-40 size-14 rounded-full shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-dark-green lg:right-6 lg:bottom-6"
      >
        <Bot className="size-14" />
      </button>

      <div
        role="dialog"
        aria-label="Juno.ai"
        hidden={!open}
        className={cx(
          "on-dark fixed z-50 flex flex-col gap-3.5 bg-green p-4.5",
          "max-lg:inset-0 max-lg:pt-[max(1.125rem,env(safe-area-inset-top))]",
          "lg:right-6 lg:bottom-6 lg:max-h-[min(40rem,calc(100dvh-3rem))] lg:w-85 lg:rounded-[20px] lg:border lg:border-separator-border lg:shadow-xl",
        )}
      >
        <div className="flex items-center gap-3">
          <Bot className="size-12" />
          <span className="me-auto text-headline-medium">Juno.ai</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close Juno.ai"
            className="flex size-11 items-center justify-center rounded-full outline-none hover:bg-dark-green/50 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            <RiCloseLine className="size-5" aria-hidden />
          </button>
        </div>

        <div role="log" aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain">
          <p className="max-w-[90%] rounded-[16px_16px_16px_4px] bg-dark-green px-3.5 py-3 text-copy-sm">{GREETING}</p>
          {messages.map((message) =>
            message.role === "user" ? (
              <p
                key={message.id}
                className="max-w-[85%] self-end whitespace-pre-line rounded-[16px_16px_4px_16px] bg-radiant px-3.5 py-3 text-copy-sm text-dark-green"
              >
                {message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
              </p>
            ) : (
              <Reply
                key={message.id}
                text={message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
                onOpenCourse={closeOnPhone}
              />
            ),
          )}
          {thinking && (
            <div className="flex items-center gap-2 text-body-regular text-text-secondary">
              <Spinner size="sm" aria-label="Juno.ai is thinking" />
              Thinking…
            </div>
          )}
          {error && (
            <p className="text-body-regular text-text-error-primary">
              {error.message === "busy" ? "Juno.ai is busy, try again in a moment." : "Juno.ai couldn't answer that. Try again?"}
            </p>
          )}
          <div ref={end} />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions(pathname).map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => ask(text)}
                className="min-h-11 rounded-full border border-radiant px-3 text-body-2-regular text-radiant outline-none hover:bg-radiant/10 focus-visible:ring-2 focus-visible:ring-border-focus-ring lg:min-h-9"
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
            aria-label="Message Juno.ai"
            placeholder="Ask Juno.ai"
            value={draft}
            onChange={setDraft}
            autoComplete="off"
            ref={input}
            className="flex-1"
            {...touchInput}
            fieldClassName="rounded-full bg-dark-green px-3.5 py-0 border border-separator-border"
          />
          <Button
            type="submit"
            iconOnly
            leadingIcon={RiArrowUpLine}
            aria-label="Send"
            disabled={busy || !draft.trim()}
            className="size-11 shrink-0 rounded-full p-0 shadow-none"
          />
        </form>
      </div>
    </>
  );
}
