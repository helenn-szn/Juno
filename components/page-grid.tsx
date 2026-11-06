import type { ReactNode } from "react";

/** A main column and a right column. On a phone the right column drops under the main one. */
export function PageGrid({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="grid items-start gap-7 p-6 lg:p-7 min-[1100px]:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="flex min-w-0 flex-col gap-9">{main}</div>
      <div className="flex min-w-0 flex-col gap-3.5">{side}</div>
    </div>
  );
}

export function Section({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="text-title-2-medium tracking-[-0.02em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** What a list shows when there is nothing in it yet. */
export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-line px-5 py-6 text-body-regular text-text-secondary">{children}</p>;
}
