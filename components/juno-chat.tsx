"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { RiArrowUpLine, RiCloseLine, RiImageAddLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Spinner } from "@/components/base/spinner/spinner";
import { CourseRow } from "@/components/course-card";
import { touchInput } from "@/components/touch-input";
import { findCourse } from "@/lib/courses";
import { uploadImage } from "@/lib/upload-client";
import { cx } from "@/utils/cx";

const transport = new DefaultChatTransport({ api: "/api/juno-ai" });
const GREETING = "Hello there, what can I help you with?";
const ONBOARDING_GREETING = "Hi! Before your first course, let's make it fit your life. I'll ask a few quick questions about what you know and when you can study.";
const MARKER = /\[course:([a-z0-9-]+)\]/g;

function suggestions(pathname: string, hasProfile: boolean) {
  if (!hasProfile) return ["Set up my learning plan", "Recommend a course"];
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

export function JunoChat({ hasProfile }: { hasProfile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState<{ url: string; type: "uploading" | "ready" | "error" }>();
  const picker = useRef<HTMLInputElement>(null);
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

  // Other parts of the app (the dashboard's "Chat with Juno.ai") can ask it to open.
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("juno-open", show);
    return () => window.removeEventListener("juno-open", show);
  }, []);

  // When Juno.ai saves her plan from the chat, the rest of the app learns of it.
  const saved = messages.some((message) => message.parts.some((part) => part.type === "tool-saveProfile" && part.state === "output-available"));
  useEffect(() => {
    if (!saved) return;
    router.refresh();
  }, [saved, router]);

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

  async function attach(file: File | undefined) {
    if (!file) return;
    setPhoto({ url: URL.createObjectURL(file), type: "uploading" });
    try {
      const url = await uploadImage(file, "chat");
      setPhoto({ url, type: "ready" });
    } catch {
      setPhoto({ url: "", type: "error" });
    }
  }

  function ask(text: string) {
    const question = text.trim();
    const image = photo?.type === "ready" ? photo.url : undefined;
    if ((!question && !image) || busy || photo?.type === "uploading") return;
    sendMessage(
      { text: question || "What do you see here?", files: image ? [{ type: "file", mediaType: "image/jpeg", url: image }] : undefined },
      { body: { page: pathname } },
    );
    setDraft("");
    setPhoto(undefined);
  }

  // On a course's learn page her study agent is already beside the lesson, so Juno.ai steps aside.
  if (/^\/app\/courses\/[^/]+\/learn\/?$/.test(pathname)) return null;

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
          <p className="max-w-[90%] rounded-[16px_16px_16px_4px] bg-dark-green px-3.5 py-3 text-copy-sm">{hasProfile || saved ? GREETING : ONBOARDING_GREETING}</p>
          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex max-w-[85%] flex-col items-end gap-1.5 self-end">
                {message.parts.map((part, index) =>
                  part.type === "file" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- her own upload
                    <img key={index} src={part.url} alt="Your photo" className="max-h-48 rounded-2xl object-cover" />
                  ) : null,
                )}
                <p className="whitespace-pre-line rounded-[16px_16px_4px_16px] bg-radiant px-3.5 py-3 text-copy-sm text-dark-green">
                  {message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
                </p>
              </div>
            ) : (
              <div key={message.id} className="flex flex-col gap-2">
                <Reply text={message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")} onOpenCourse={closeOnPhone} />
                {message.parts.some((part) => part.type === "tool-saveProfile" && part.state === "output-available") && (
                  <Link
                    href="/app/onboarding"
                    onClick={closeOnPhone}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-dark-green px-3.5 py-2.5 text-body-medium outline-none hover:bg-dark-green/70 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                  >
                    Your plan is saved. See or change it
                    <span aria-hidden className="text-radiant">→</span>
                  </Link>
                )}
              </div>
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
            {suggestions(pathname, hasProfile || saved).map((text) => (
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

        {photo && (
          <div className="flex items-center gap-3">
            {photo.type === "error" ? (
              <p role="alert" className="me-auto text-body-regular text-text-error-primary">That photo didn&apos;t upload. Try another?</p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- her own upload
              <img src={photo.url} alt="Photo to send" className={cx("size-14 rounded-xl object-cover", photo.type === "uploading" && "opacity-50")} />
            )}
            {photo.type === "uploading" && <Spinner size="sm" aria-label="Uploading photo" />}
            <button
              type="button"
              onClick={() => setPhoto(undefined)}
              aria-label="Remove photo"
              className="ms-auto flex size-11 items-center justify-center rounded-full outline-none hover:bg-dark-green/50 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              <RiCloseLine className="size-5" aria-hidden />
            </button>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={picker}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose a photo"
            hidden
            onChange={(event) => {
              attach(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            iconOnly
            leadingIcon={RiImageAddLine}
            aria-label="Add a photo"
            onClick={() => picker.current?.click()}
            className="size-11 shrink-0 rounded-full p-0 shadow-none"
          />
          <Input
            aria-label="Message Juno.ai"
            placeholder="Ask Juno.ai"
            value={draft}
            onChange={setDraft}
            autoComplete="off"
            ref={input}
            className="flex-1"
            {...touchInput}
          />
          <Button
            type="submit"
            iconOnly
            leadingIcon={RiArrowUpLine}
            aria-label="Send"
            disabled={busy || photo?.type === "uploading" || (!draft.trim() && photo?.type !== "ready")}
            className="size-11 shrink-0 rounded-full p-0 shadow-none"
          />
        </form>
      </div>
    </>
  );
}
