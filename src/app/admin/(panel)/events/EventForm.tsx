"use client";

import { useActionState, useId } from "react";
import { saveEvent, type EventFormState } from "./actions";

export type EventFormValues = {
  id?: string; title: string; slug: string; description: string; published: boolean;
  startsAtLocal: string; datePublic: boolean; venueName: string; venuePublic: boolean;
  ticketUrl: string; imageUrl: string | null; imageAlt: string;
};

export const EMPTY_EVENT: EventFormValues = {
  title: "", slug: "", description: "", published: false, startsAtLocal: "", datePublic: false,
  venueName: "", venuePublic: false, ticketUrl: "", imageUrl: null, imageAlt: "",
};

const idle: EventFormState = { status: "idle" };
const field = "block w-full min-h-14 rounded-sm border-[3px] border-ink bg-field px-4 text-base text-ink placeholder:text-ink-soft";
const label = "mb-1 block text-sm font-semibold";
const check = "mt-0.5 size-6 shrink-0 accent-primary";
const help = "mt-1 text-sm text-ink-soft";

export function EventForm({ values }: { values: EventFormValues }) {
  const [state, action, pending] = useActionState(saveEvent, idle);
  const uid = useId();

  return (
    <form action={action} className="grid max-w-2xl gap-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div>
        <label htmlFor={`${uid}-title`} className={label}>Title</label>
        <input id={`${uid}-title`} name="title" required defaultValue={values.title} className={field} />
      </div>
      <div>
        <label htmlFor={`${uid}-slug`} className={label}>Web address (optional)</label>
        <input id={`${uid}-slug`} name="slug" defaultValue={values.slug} placeholder="made from the title if blank" className={field} />
        <p className={help}>Shows as paradisesessions.com/events/<em>this-part</em>.</p>
      </div>
      <div>
        <label htmlFor={`${uid}-desc`} className={label}>Description</label>
        <textarea id={`${uid}-desc`} name="description" rows={5} defaultValue={values.description} className={`${field} py-3`} />
        <p className={help}>Shown publicly as written. Don&apos;t mention the venue or date here until their boxes below are on.</p>
      </div>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Date (Pacific time)</legend>
        <input aria-label="Date and time" type="datetime-local" name="starts_at" defaultValue={values.startsAtLocal} className={field} />
        <label className="flex items-start gap-3">
          <input type="checkbox" name="date_public" defaultChecked={values.datePublic} className={check} />
          <span>Show the date publicly<span className={`block ${help}`}>Tick only after a signed agreement for this show. Off = visitors see &ldquo;Coming soon.&rdquo;</span></span>
        </label>
      </fieldset>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Venue</legend>
        <input aria-label="Venue name" name="venue_name" defaultValue={values.venueName} className={field} />
        <label className="flex items-start gap-3">
          <input type="checkbox" name="venue_public" defaultChecked={values.venuePublic} className={check} />
          <span>Show the venue publicly<span className={`block ${help}`}>Tick only after a signed agreement for this show. Off = visitors see &ldquo;San Diego&rsquo;s South Bay.&rdquo;</span></span>
        </label>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-tix`} className={label}>Ticket link (optional)</label>
        <input id={`${uid}-tix`} name="ticket_url" type="url" defaultValue={values.ticketUrl} placeholder="https://" className={field} />
        <p className={help}>Add only when tickets are really on sale.</p>
      </div>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Photo (optional)</legend>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {values.imageUrl && <img src={values.imageUrl} alt={values.imageAlt} className="max-h-48 w-auto rounded-sm" />}
        <input aria-label="Photo file" type="file" name="image" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[3px] file:border-ink file:bg-primary file:px-4 file:font-bold file:text-on-primary" />
        <p className={help}>JPG, PNG, or WebP, under 5 MB. Real photos of real people need their permission.</p>
        <div>
          <label htmlFor={`${uid}-alt`} className={label}>Describe the photo (alt text)</label>
          <input id={`${uid}-alt`} name="image_alt" defaultValue={values.imageAlt} className={field} />
        </div>
        {values.imageUrl && (
          <label className="flex items-center gap-3">
            <input type="checkbox" name="remove_image" className={check} /> Remove this photo
          </label>
        )}
      </fieldset>

      <label className="flex items-start gap-3 rounded-sm border-[3px] border-primary p-4">
        <input type="checkbox" name="published" defaultChecked={values.published} className={check} />
        <span className="font-bold">Published<span className={`block font-normal ${help}`}>Off = draft, visible only here. On = appears on the public site (date and venue still follow their own boxes above).</span></span>
      </label>

      <p role="status" aria-live="polite" className="text-sm font-semibold">
        {state.status === "error" && <span className="text-chili">{state.message}</span>}
      </p>
      <button
        type="submit" disabled={pending}
        className="min-h-14 rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop transition-transform hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Saving…" : "Save event"}
      </button>
    </form>
  );
}
