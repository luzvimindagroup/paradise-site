"use client";

import { usePreservedForm } from "@/lib/generic/forms/usePreservedForm";
import { useEffect, useId } from "react";
import { saveWelcome, type WelcomeState } from "@/app/actions";
import { track } from "@/lib/generic/analytics/track";
import { GENRES, GROUP_SIZES, HOW_HEARD, LANGUAGES, PRICE_BANDS, TICKET_INTEREST } from "@/config/signup";

const idle: WelcomeState = { status: "idle" };
const field =
  "block w-full min-h-14 rounded-sm border-[3px] border-ink bg-field px-4 text-base text-ink placeholder:text-ink-soft";
const label = "mb-1 block text-sm font-semibold text-ink";
const chip =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border-[3px] border-ink px-3 text-sm font-semibold has-[:checked]:bg-primary has-[:checked]:text-on-primary has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-primary";

export function WelcomeForm() {
  const [state, onSubmit, pending] = usePreservedForm(saveWelcome, idle);
  const uid = useId();
  const saved = state.status === "saved";
  useEffect(() => { if (saved) track("profile_complete"); }, [saved]);

  if (saved) {
    return (
      <p role="status" className="font-display text-3xl leading-tight font-bold">
        Saved. Thanks, we&apos;ll keep you posted.
      </p>
    );
  }

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-6">
      <p className="text-ink-soft">Everything here is optional. Skip any of it.</p>

      <div>
        <label htmlFor={`${uid}-lang`} className={label}>
          Language you prefer for emails (we use English unless you tell us)
        </label>
        <select id={`${uid}-lang`} name="language" defaultValue="" className={field}>
          <option value="">Keep as is</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-group`} className={label}>Who do you usually go with?</label>
          <select id={`${uid}-group`} name="group_size" defaultValue="" className={field}>
            <option value="">Skip</option>
            {GROUP_SIZES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-price`} className={label}>Ticket price you&apos;re comfortable with</label>
          <select id={`${uid}-price`} name="price_band" defaultValue="" className={field}>
            <option value="">Skip</option>
            {PRICE_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={label}>What do you like to hear and see?</legend>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <label key={g} className={chip}>
              <input type="checkbox" name="genres" value={g} className="sr-only" />
              {g}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Ticket interest</legend>
        <div className="flex flex-wrap gap-2">
          {TICKET_INTEREST.map((t) => (
            <label key={t} className={chip}>
              <input type="radio" name="ticket_interest" value={t} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>Name</label>
          <input id={`${uid}-name`} name="name" autoComplete="name" className={field} />
        </div>
        <div>
          <label htmlFor={`${uid}-city`} className={label}>City</label>
          <input id={`${uid}-city`} name="city" autoComplete="address-level2" className={field} />
        </div>
        <div>
          <label htmlFor={`${uid}-how`} className={label}>How did you hear about us?</label>
          <select id={`${uid}-how`} name="how_heard" defaultValue="" className={field}>
            <option value="">Skip</option>
            {HOW_HEARD.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-ig`} className={label}>Instagram handle</label>
          <input id={`${uid}-ig`} name="instagram" placeholder="@yourname" autoCapitalize="none" className={field} />
        </div>
      </div>

      <button
        type="submit" disabled={pending}
        className="min-h-14 rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-70"
      >
        {pending ? "Saving…" : "Save my answers"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-sm font-semibold text-chili">{state.message}</p>
      )}
    </form>
  );
}
