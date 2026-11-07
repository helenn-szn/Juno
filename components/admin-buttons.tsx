"use client";

import { useState, useTransition } from "react";
import { approveMentor, askForChanges, refundReview } from "@/app/admin/actions";
import { Button } from "@/components/base/buttons/button";

const pill = "h-11 rounded-full px-5 shadow-none";

/** Approve with one click, or say what to add ("Not yet"). */
export function ReviewApplication({ userId }: { userId: string }) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button className={pill} disabled={pending} onClick={() => start(() => approveMentor(userId))}>
          {pending && !asking ? "Approving…" : "Approve"}
        </Button>
        <Button variant="secondary" className={pill} disabled={pending} onClick={() => setAsking((v) => !v)}>
          Not yet
        </Button>
      </div>
      {asking && (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            start(() => askForChanges(userId, note));
          }}
        >
          <label htmlFor={`note-${userId}`} className="text-body-medium">What should she add?</label>
          <textarea id={`note-${userId}`} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. A link to something you've built" />
          <Button type="submit" className={pill} disabled={pending}>Send note</Button>
        </form>
      )}
    </div>
  );
}

export function RefundButton({ requestId }: { requestId: string }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-1.5">
      <Button
        variant="secondary"
        className={pill}
        disabled={pending}
        onClick={() => start(async () => setMessage((await refundReview(requestId)).reason ?? ""))}
      >
        {pending ? "Refunding…" : "Refund her"}
      </Button>
      <p role="status" className="text-body-2-regular text-text-error-primary">{message}</p>
    </div>
  );
}
