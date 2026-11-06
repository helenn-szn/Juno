"use client";

import { useEffect, useRef, useState } from "react";
import { RiChat3Line, RiCloseLine } from "@remixicon/react";
import { StudyAgent } from "@/components/study-agent";

const WIDE = "(min-width: 1100px)";
const KEY = "juno-study-agent-open";

/**
 * Her study agent, beside the lesson. On a wide screen it sits in a column next to
 * the module and she can fold it away to a small button. On a phone it stays out of
 * the way as a button and opens as a full-screen sheet. Her chat survives folding.
 */
export function StudyPanel({ course, stuckOn }: { course: string; stuckOn: string }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  // Wide screens start open (or as she left it). Phones always start folded.
  // This reads the browser's screen size and storage, which the server can't know.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!window.matchMedia(WIDE).matches) return;
    try {
      setOpen(localStorage.getItem(KEY) !== "0");
    } catch {
      setOpen(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function show(next: boolean) {
    opened.current = true;
    setOpen(next);
    if (window.matchMedia(WIDE).matches) {
      try {
        localStorage.setItem(KEY, next ? "1" : "0");
      } catch {}
    }
  }

  // After folding it away, focus goes back to the button that brings it back.
  useEffect(() => {
    if (!open && opened.current) opener.current?.focus();
  }, [open]);

  // On a phone the sheet covers the screen: Escape folds it, and the page behind stays put.
  useEffect(() => {
    if (!open || window.matchMedia(WIDE).matches) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && show(false);
    window.addEventListener("keydown", onKey);
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = before;
    };
  }, [open]);

  return (
    <aside aria-label="Study agent" className="min-[1100px]:sticky min-[1100px]:top-6 min-[1100px]:self-start">
      <button
        ref={opener}
        type="button"
        hidden={open}
        aria-expanded={open}
        aria-controls="study-panel"
        onClick={() => show(true)}
        className="on-dark flex min-h-12 items-center gap-2 rounded-full bg-green px-4 text-body-medium shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring max-[1099px]:fixed max-[1099px]:bottom-20 max-[1099px]:left-4 max-[1099px]:z-40"
      >
        <RiChat3Line className="size-5 text-radiant" aria-hidden />
        Study agent
      </button>

      <div
        id="study-panel"
        role="region"
        aria-label="Study agent chat"
        hidden={!open}
        className="on-dark flex flex-col gap-3.5 bg-green p-4.5 max-[1099px]:fixed max-[1099px]:inset-0 max-[1099px]:z-50 max-[1099px]:pt-[max(1.125rem,env(safe-area-inset-top))] min-[1100px]:h-[calc(100dvh-3rem)] min-[1100px]:max-h-190 min-[1100px]:w-88 min-[1100px]:rounded-[20px]"
      >
        <div className="flex items-center gap-2">
          <h2 className="me-auto text-headline-medium">Study agent</h2>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="study-panel"
            aria-label="Fold away the study agent"
            onClick={() => show(false)}
            className="flex size-11 items-center justify-center rounded-full outline-none hover:bg-dark-green/50 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            <RiCloseLine className="size-5" aria-hidden />
          </button>
        </div>
        <StudyAgent course={course} stuckOn={stuckOn} />
      </div>
    </aside>
  );
}
