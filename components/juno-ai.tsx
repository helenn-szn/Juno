"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowUpLine, RiSparkling2Fill } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader } from "@/components/base/drawer/drawer";
import { Input } from "@/components/base/input/input";
import { Spinner } from "@/components/base/spinner/spinner";
import { CourseCard } from "@/components/course-card";
import { touchInput } from "@/components/touch-input";
import { findCourse } from "@/lib/courses";
import { cx } from "@/utils/cx";

type Turn = { role: "user" | "assistant"; content: string; courses?: string[] };

const GREETING = "Hi! Ask me about Juno, or tell me what you'd like to learn and I'll find a course.";

export function JunoAi() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [problem, setProblem] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [turns, thinking, problem]);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || thinking) return;

    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setDraft("");
    setProblem("");
    setThinking(true);
    try {
      const res = await fetch("/api/juno-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error(String(res.status));
      const answer: { reply: string; courses: string[] } = await res.json();
      setTurns([...next, { role: "assistant", content: answer.reply, courses: answer.courses }]);
    } catch {
      setProblem("I couldn't answer that. Try again?");
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        leadingIcon={RiSparkling2Fill}
        className="h-12 w-full rounded-full shadow-none"
      >
        Ask Juno.ai
      </Button>

      <Drawer isOpen={open} onOpenChange={setOpen} aria-label="Juno.ai" className="gap-0">
        <DrawerHeader title="Juno.ai" className="pb-4" />
        <DrawerBody>
          <div role="log" aria-live="polite" className="flex flex-col gap-4 py-2">
            <Bubble turn={{ role: "assistant", content: GREETING }} />
            {turns.map((turn, index) => (
              <Bubble key={index} turn={turn} />
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-body-regular text-text-secondary">
                <Spinner size="sm" aria-label="Juno.ai is thinking" />
                Thinking…
              </div>
            )}
            {problem && <p className="text-body-regular text-text-error-primary">{problem}</p>}
            <div ref={end} />
          </div>
        </DrawerBody>
        <DrawerFooter className="pt-4 pb-6">
          <form onSubmit={ask} className="flex w-full items-center gap-2">
            <Input
              aria-label="Message Juno.ai"
              placeholder="Ask about a course"
              value={draft}
              onChange={setDraft}
              isDisabled={thinking}
              autoComplete="off"
              className="flex-1"
              {...touchInput}
            />
            <Button
              type="submit"
              iconOnly
              leadingIcon={RiArrowUpLine}
              aria-label="Send"
              disabled={thinking || !draft.trim()}
              className="size-11 shrink-0 rounded-full p-0 shadow-none"
            />
          </form>
        </DrawerFooter>
      </Drawer>
    </>
  );
}

function Bubble({ turn }: { turn: Turn }) {
  const recommended = (turn.courses ?? []).flatMap((slug) => findCourse(slug) ?? []);
  return (
    <div className={cx("flex flex-col gap-3", turn.role === "user" && "items-end")}>
      <p
        className={cx(
          "max-w-[85%] text-body-regular",
          turn.role === "user"
            ? "rounded-2xl bg-background-primary-default px-4 py-2.5 text-text-primary"
            : "text-text-primary",
        )}
      >
        {turn.content}
      </p>
      {recommended.map((course) => (
        <CourseCard key={course.slug} course={course} className="w-full bg-background-full" />
      ))}
    </div>
  );
}
