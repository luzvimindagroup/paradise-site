"use client";

import { usePreservedForm } from "@/lib/generic/forms/usePreservedForm";
import { useEffect, useId } from "react";
import { sendContact, type ContactState } from "@/app/contact/actions";
import { AttributionFields } from "@/components/AttributionFields";
import { CONTACT_CATEGORIES } from "@/config/contact";
import { track } from "@/lib/generic/analytics/track";

const idle: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, onSubmit, pending] = usePreservedForm(sendContact, idle);
  const uid = useId();
  const err = state.status === "error" ? state : null;
  const sentCategory = state.status === "sent" ? state.category : undefined;
  useEffect(() => { if (sentCategory) track("contact_submit", { category: sentCategory }); }, [sentCategory]);

  const field =
    "block w-full min-h-14 rounded-sm border-[3px] border-ink bg-field px-4 text-base text-ink placeholder:text-ink-soft";
  const label = "mb-1 block text-sm font-semibold text-ink";

  if (state.status === "sent") {
    return (
      <p role="status" className="font-display text-2xl leading-tight font-bold">
        Got it. Thank you. We read every message and will reply by email.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4" aria-describedby={`${uid}-status`}>
      <AttributionFields />
      {/* Honeypot: people never see or reach this; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label htmlFor={`${uid}-cat`} className={label}>What is this about?</label>
        <select
          id={`${uid}-cat`} name="category" required defaultValue=""
          aria-invalid={err?.field === "category"} className={field}
        >
          <option value="" disabled>Choose one</option>
          {CONTACT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>Name</label>
          <input
            id={`${uid}-name`} name="name" type="text" required autoComplete="name"
            aria-invalid={err?.field === "name"} className={field}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={label}>Email</label>
          <input
            id={`${uid}-email`} name="email" type="email" required inputMode="email"
            autoComplete="email" placeholder="you@email.com"
            aria-invalid={err?.field === "email"} className={field}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-msg`} className={label}>Message</label>
        <textarea
          id={`${uid}-msg`} name="message" required rows={6} maxLength={3000}
          aria-invalid={err?.field === "message"} className={`${field} py-3`}
        />
      </div>
      <button
        type="submit" disabled={pending}
        className="min-h-14 rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop transition-transform hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
      <p id={`${uid}-status`} role="status" aria-live="polite" className="text-sm font-semibold">
        {err && <span className="text-chili">{err.message}</span>}
        {state.status === "not_connected" && <span className="text-ink">{state.message}</span>}
      </p>
    </form>
  );
}
