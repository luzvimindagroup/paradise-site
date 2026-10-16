"use client";

import { useId, useState } from "react";
import { PhotoPicker } from "@/components/PhotoPicker";
import { usePreservedForm } from "@/lib/generic/forms/usePreservedForm";
import { saveLanding, type LandingFormState } from "./actions";

export type LandingFormValues = {
  id?: string; headline: string; slug: string; subheadline: string; body: string; ctaLabel: string;
  artistId: string; eventId: string; imageUrl: string | null; imageAlt: string;
  seoTitle: string; seoDescription: string; hideFromSearch: boolean; published: boolean;
};
export type Choice = { id: string; label: string };

export const EMPTY_LANDING: LandingFormValues = {
  headline: "", slug: "", subheadline: "", body: "", ctaLabel: "Get first access", artistId: "", eventId: "",
  imageUrl: null, imageAlt: "", seoTitle: "", seoDescription: "", hideFromSearch: false, published: false,
};

const idle: LandingFormState = { status: "idle" };
const field = "block w-full min-h-14 rounded-sm border-[3px] border-ink bg-field px-4 text-base text-ink placeholder:text-ink-soft";
const label = "mb-1 block text-sm font-semibold";
const check = "mt-0.5 size-6 shrink-0 accent-primary";
const help = "mt-1 text-sm text-ink-soft";

// Search engines cut titles and descriptions at about these lengths.
const TITLE_GOOD = 60;
const DESC_GOOD = 155;

export function LandingForm({ values, artists, events }: { values: LandingFormValues; artists: Choice[]; events: Choice[] }) {
  const [state, onSubmit, pending] = usePreservedForm(saveLanding, idle);
  const uid = useId();
  const [headline, setHeadline] = useState(values.headline);
  const [sub, setSub] = useState(values.subheadline);
  const [seoTitle, setSeoTitle] = useState(values.seoTitle);
  const [seoDesc, setSeoDesc] = useState(values.seoDescription);
  const shownTitle = seoTitle || headline || "Your headline";
  const shownDesc = seoDesc || sub || "Your subheadline, or the description you write below.";

  return (
    <form method="post" onSubmit={onSubmit} className="grid max-w-2xl gap-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div>
        <label htmlFor={`${uid}-h`} className={label}>Headline</label>
        <input id={`${uid}-h`} name="headline" required maxLength={90} defaultValue={values.headline} onChange={(e) => setHeadline(e.target.value)} className={field} />
        <p className={help}>The big line. Say the one thing you want people to do or feel. Don&apos;t name a venue, date, or sponsor unless they&apos;re public.</p>
      </div>
      <div>
        <label htmlFor={`${uid}-sub`} className={label}>Subheadline (optional)</label>
        <input id={`${uid}-sub`} name="subheadline" maxLength={200} defaultValue={values.subheadline} onChange={(e) => setSub(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor={`${uid}-body`} className={label}>A few more words (optional)</label>
        <textarea id={`${uid}-body`} name="body" rows={4} maxLength={1500} defaultValue={values.body} className={`${field} py-3`} />
      </div>
      <div>
        <label htmlFor={`${uid}-cta`} className={label}>Button text</label>
        <input id={`${uid}-cta`} name="cta_label" maxLength={30} defaultValue={values.ctaLabel} className={field} />
      </div>
      <div>
        <label htmlFor={`${uid}-slug`} className={label}>Web address (optional)</label>
        <input id={`${uid}-slug`} name="slug" defaultValue={values.slug} placeholder="made from the headline if blank" className={field} />
        <p className={help}>Shows as paradisesessions.com/l/<em>this-part</em>. Keep it short and use words people would search for. Changing it later breaks old links.</p>
      </div>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Link to an artist or event (optional)</legend>
        <p className={help}>Leave both empty for a general page. A linked page borrows that photo and only shows while the artist or event is public.</p>
        <div>
          <label htmlFor={`${uid}-art`} className={label}>Artist</label>
          <select id={`${uid}-art`} name="artist_id" defaultValue={values.artistId} className={field}>
            <option value="">None</option>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-ev`} className={label}>Event</label>
          <select id={`${uid}-ev`} name="event_id" defaultValue={values.eventId} className={field}>
            <option value="">None</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Photo (optional)</legend>
        <p className={help}>Skip it to use the linked artist&apos;s or event&apos;s photo. With no photo at all, the page is type-only.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {values.imageUrl && <img src={values.imageUrl} alt={values.imageAlt} className="max-h-48 w-auto rounded-sm" />}
        <PhotoPicker />
        <div>
          <label htmlFor={`${uid}-alt`} className={label}>Describe the photo (alt text)</label>
          <input id={`${uid}-alt`} name="image_alt" defaultValue={values.imageAlt} className={field} />
        </div>
        {values.imageUrl && (
          <label className="flex items-center gap-3"><input type="checkbox" name="remove_image" className={check} /> Remove this photo</label>
        )}
      </fieldset>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Search engines (SEO)</legend>
        <div>
          <label htmlFor={`${uid}-st`} className={label}>Search title</label>
          <input id={`${uid}-st`} name="seo_title" maxLength={70} defaultValue={values.seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="uses the headline if blank" className={field} />
          <p className={`${help} ${shownTitle.length > TITLE_GOOD ? "text-chili" : ""}`}>{shownTitle.length} characters. Aim for {TITLE_GOOD} or fewer, with the main words first.</p>
        </div>
        <div>
          <label htmlFor={`${uid}-sd`} className={label}>Search description</label>
          <textarea id={`${uid}-sd`} name="seo_description" rows={3} maxLength={160} defaultValue={values.seoDescription} onChange={(e) => setSeoDesc(e.target.value)} placeholder="uses the subheadline if blank" className={`${field} py-3`} />
          <p className={`${help} ${shownDesc.length > DESC_GOOD ? "text-chili" : ""}`}>{shownDesc.length} characters. Aim for {DESC_GOOD} or fewer. Say what the page offers and why to click.</p>
        </div>
        <div aria-label="Search result preview" className="rounded-sm bg-paper-deep p-4">
          <p className="text-xs text-ink-soft">What it may look like in search</p>
          <p className="mt-1 text-lg text-primary">{shownTitle.slice(0, 70)} | Paradise Sessions</p>
          <p className="text-sm text-ink-soft">{shownDesc.slice(0, 160)}</p>
        </div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="hide_from_search" defaultChecked={values.hideFromSearch} className={check} />
          <span>Hide this page from search engines<span className={`block ${help}`}>Good for ad-only pages you don&apos;t want showing up in Google. Everything stays hidden anyway until the whole site goes live.</span></span>
        </label>
      </fieldset>

      <label className="flex items-start gap-3 rounded-sm border-[3px] border-primary p-4">
        <input type="checkbox" name="published" defaultChecked={values.published} className={check} />
        <span className="font-bold">Published<span className={`block font-normal ${help}`}>Off = draft, visible only here. On = the page works at its web address. A linked artist or event must already be public.</span></span>
      </label>

      <p role="status" aria-live="polite" className="text-sm font-semibold">
        {state.status === "error" && <span className="text-chili">{state.message}</span>}
      </p>
      <button
        type="submit" disabled={pending}
        className="min-h-14 rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop transition-transform hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Saving…" : "Save page"}
      </button>
    </form>
  );
}
