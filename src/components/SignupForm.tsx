"use client";

import { useActionState, useId } from "react";
import { joinList, type JoinState } from "@/app/actions";

const idle: JoinState = { status: "idle" };

export function SignupForm({ onDark = false }: { onDark?: boolean }) {
  const [state, action, pending] = useActionState(joinList, idle);
  const uid = useId();
  const err = state.status === "error" ? state : null;

  const field =
    "block w-full min-h-14 rounded-sm border-[3px] border-ink bg-white px-4 text-base text-ink placeholder:text-ink-soft " +
    (onDark ? "focus-visible:outline-lime" : "");
  const label = "mb-1 block text-sm font-semibold " + (onDark ? "text-white" : "text-ink");
  const errText = onDark ? "text-lime" : "text-chili";

  return (
    <form action={action} noValidate className="grid gap-4" aria-describedby={`${uid}-status`}>
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <div>
          <label htmlFor={`${uid}-email`} className={label}>Email</label>
          <input
            id={`${uid}-email`} name="email" type="email" required
            inputMode="email" autoComplete="email" placeholder="you@email.com"
            aria-invalid={err?.field === "email"} className={field}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-zip`} className={label}>ZIP code</label>
          <input
            id={`${uid}-zip`} name="zip" type="text" required
            inputMode="numeric" autoComplete="postal-code" maxLength={5}
            pattern="[0-9]{5}" placeholder="91950"
            aria-invalid={err?.field === "zip"} className={field}
          />
        </div>
      </div>

      <label className={"flex items-start gap-3 text-sm " + (onDark ? "text-white" : "text-ink")}>
        <input
          type="checkbox" name="consent" required
          aria-invalid={err?.field === "consent"}
          className={"mt-0.5 size-6 shrink-0 accent-primary " + (onDark ? "focus-visible:outline-lime" : "")}
        />
        <span>Yes, email me about Paradise shows and news. I can unsubscribe anytime.</span>
      </label>

      <button
        type="submit" disabled={pending}
        className={
          "min-h-14 rounded-sm border-[3px] border-ink px-6 text-lg font-bold shadow-pop transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70 " +
          (onDark
            ? "bg-lime text-ink focus-visible:outline-lime"
            : "bg-primary text-white hover:bg-primary-deep")
        }
      >
        {pending ? "Joining…" : "Get first access"}
      </button>

      <p id={`${uid}-status`} role="status" aria-live="polite" className="text-sm font-semibold">
        {err && <span className={errText}>{err.message}</span>}
        {state.status === "not_connected" && (
          <span className={onDark ? "text-white" : "text-ink"}>{state.message}</span>
        )}
      </p>
    </form>
  );
}
