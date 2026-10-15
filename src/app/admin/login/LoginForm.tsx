"use client";

import { useActionState, useId } from "react";
import { requestLoginLink, type LoginState } from "./actions";

const idle: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(requestLoginLink, idle);
  const uid = useId();

  if (state.status === "sent") {
    return (
      <p role="status" className="text-lg">
        If that email has access, a sign-in link is on its way. Open it in <strong>this same browser</strong>.
      </p>
    );
  }
  return (
    <form action={action} noValidate className="grid gap-4">
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1 block text-sm font-semibold">Email</label>
        <input
          id={`${uid}-email`} name="email" type="email" required inputMode="email" autoComplete="email"
          className="block w-full min-h-14 rounded-sm border-[3px] border-ink bg-field px-4 text-base text-ink"
        />
      </div>
      <button
        type="submit" disabled={pending}
        className="min-h-14 rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop transition-transform hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p role="status" aria-live="polite" className="text-sm font-semibold">
        {state.status === "error" && <span className="text-chili">{state.message}</span>}
      </p>
    </form>
  );
}
