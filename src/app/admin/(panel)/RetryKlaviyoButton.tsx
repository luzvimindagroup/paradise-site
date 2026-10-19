"use client";

import { useActionState } from "react";
import { retryKlaviyo, type RetryState } from "./actions";

const idle: RetryState = { status: "idle" };

export function RetryKlaviyoButton({ count }: { count: number }) {
  const [state, action, pending] = useActionState(retryKlaviyo, idle);
  if (count === 0 && state.status === "idle") return null;
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-3 text-sm">
      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink px-4 font-bold disabled:cursor-wait disabled:opacity-70">
        {pending ? "Retrying…" : "Retry failed Klaviyo syncs"}
      </button>
      <span role="status" aria-live="polite">
        {state.status === "done" && `${state.synced} synced, ${state.failed} still failing.`}
        {state.status === "error" && <span className="text-chili">{state.message}</span>}
      </span>
    </form>
  );
}
