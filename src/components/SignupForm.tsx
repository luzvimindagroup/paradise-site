"use client";

import { usePreservedForm } from "@/lib/generic/forms/usePreservedForm";
import { useId } from "react";
import { joinList, type JoinState } from "@/app/actions";
import { AttributionFields } from "@/components/AttributionFields";
import { CONSENT_TEXT, LANGUAGES } from "@/config/signup";

const idle: JoinState = { status: "idle" };

export function SignupForm({ source, showLanguage = false }: { source: string; showLanguage?: boolean }) {
  const [state, onSubmit, pending] = usePreservedForm(joinList, idle);
  const uid = useId();
  const err = state.status === "error" ? state : null;

  const field =
    "block w-full min-h-14 rounded-sm border-[3px] border-ink bg-field px-4 text-base text-ink placeholder:text-ink-soft";
  const label = "mb-1 block text-sm font-semibold text-ink";

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4" aria-describedby={`${uid}-status`}>
      <input type="hidden" name="source" value={source} />
      <AttributionFields />
      {/* Honeypot: people never see or reach this; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
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

      {showLanguage && (
        <div>
          <label htmlFor={`${uid}-lang`} className={label}>Language you prefer for emails</label>
          <select id={`${uid}-lang`} name="language" defaultValue="English" className={field}>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      )}

      <label className="flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox" name="consent" required
          aria-invalid={err?.field === "consent"}
          className="mt-0.5 size-6 shrink-0 accent-primary"
        />
        <span>{CONSENT_TEXT} <a href="/privacy" className="underline">Privacy</a></span>
      </label>

      <button
        type="submit" disabled={pending}
        className="min-h-14 rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop transition-transform hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Joining…" : "Get first access"}
      </button>

      <p id={`${uid}-status`} role="status" aria-live="polite" className="text-sm font-semibold">
        {err && <span className="text-chili">{err.message}</span>}
        {state.status === "not_connected" && (
          <span className="text-ink">{state.message}</span>
        )}
      </p>
    </form>
  );
}
