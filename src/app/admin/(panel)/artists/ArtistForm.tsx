"use client";

import { useId, useState } from "react";
import { DISCIPLINES, NEIGHBORHOODS } from "@/config/artists";
import { FIXED_LINK_TYPES, OTHER_LINK_SLOTS, type ArtistLink } from "@/lib/generic/artists/links";
import { usePreservedForm } from "@/lib/generic/forms/usePreservedForm";
import { MAX_IMAGE_BYTES } from "@/lib/generic/images/validate";
import { saveArtist, type ArtistFormState } from "./actions";

export type ArtistFormValues = {
  id?: string; name: string; slug: string; discipline: string; neighborhood: string; tagline: string;
  published: boolean; permissionOnFile: boolean; permissionDate: string;
  imageUrl: string | null; imageAlt: string; links: ArtistLink[];
};

export const EMPTY_ARTIST: ArtistFormValues = {
  name: "", slug: "", discipline: "", neighborhood: "", tagline: "", published: false,
  permissionOnFile: false, permissionDate: "", imageUrl: null, imageAlt: "", links: [],
};

const idle: ArtistFormState = { status: "idle" };
const field = "block w-full min-h-14 rounded-sm border-[3px] border-ink bg-field px-4 text-base text-ink placeholder:text-ink-soft";
const label = "mb-1 block text-sm font-semibold";
const check = "mt-0.5 size-6 shrink-0 accent-primary";
const help = "mt-1 text-sm text-ink-soft";

export function ArtistForm({ values }: { values: ArtistFormValues }) {
  const [state, onSubmit, pending] = usePreservedForm(saveArtist, idle);
  const uid = useId();
  const [photoProblem, setPhotoProblem] = useState<string | null>(null);
  const linkOf = (type: string) => values.links.find((l) => l.type === type)?.url ?? "";
  const others = values.links.filter((l) => l.type === "other");

  return (
    <form method="post" onSubmit={onSubmit} className="grid max-w-2xl gap-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div>
        <label htmlFor={`${uid}-name`} className={label}>Name</label>
        <input id={`${uid}-name`} name="name" required defaultValue={values.name} className={field} />
      </div>
      <div>
        <label htmlFor={`${uid}-slug`} className={label}>Web address (optional)</label>
        <input id={`${uid}-slug`} name="slug" defaultValue={values.slug} placeholder="made from the name if blank" className={field} />
        <p className={help}>Shows as paradisesessions.com/artists/<em>this-part</em>.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-disc`} className={label}>Discipline</label>
          <select id={`${uid}-disc`} name="discipline" required defaultValue={values.discipline} className={field}>
            <option value="" disabled>Choose one</option>
            {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-hood`} className={label}>Neighborhood</label>
          <input id={`${uid}-hood`} name="neighborhood" list={`${uid}-hoods`} defaultValue={values.neighborhood} className={field} />
          <datalist id={`${uid}-hoods`}>{NEIGHBORHOODS.map((n) => <option key={n} value={n} />)}</datalist>
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-tag`} className={label}>One line about them</label>
        <input id={`${uid}-tag`} name="tagline" maxLength={160} defaultValue={values.tagline} className={field} />
        <p className={help}>Up to 160 characters. Shown publicly. Don&apos;t include a venue, date, or sponsor.</p>
      </div>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Links (all optional)</legend>
        {FIXED_LINK_TYPES.map((t) => (
          <div key={t.type}>
            <label htmlFor={`${uid}-${t.type}`} className={label}>{t.label}</label>
            <input id={`${uid}-${t.type}`} name={`link_${t.type}`} type="url" placeholder="https://" defaultValue={linkOf(t.type)} className={field} />
          </div>
        ))}
        <p className="text-sm font-semibold">Anything else (Bandcamp, a show reel, a booking page…)</p>
        {Array.from({ length: OTHER_LINK_SLOTS }, (_, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <input aria-label={`Other link ${i + 1} name`} name={`other_label_${i}`} placeholder="Name" defaultValue={others[i]?.label ?? ""} className={field} />
            <input aria-label={`Other link ${i + 1} address`} name={`other_url_${i}`} type="url" placeholder="https://" defaultValue={others[i]?.url ?? ""} className={field} />
          </div>
        ))}
      </fieldset>

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-ink p-4">
        <legend className="px-2 text-sm font-bold">Photo (required to publish)</legend>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {values.imageUrl && <img src={values.imageUrl} alt={values.imageAlt} className="max-h-48 w-auto rounded-sm" />}
        <input
          aria-label="Photo file" type="file" name="image" accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && f.size > MAX_IMAGE_BYTES) { setPhotoProblem("That photo is over 4 MB. Choose a smaller one."); e.target.value = ""; }
            else setPhotoProblem(null);
          }}
          className="block w-full text-sm file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[3px] file:border-ink file:bg-primary file:px-4 file:font-bold file:text-on-primary"
        />
        <p className={help}>JPG, PNG, or WebP, under 4 MB. Favor warm or white-lit photos over red/blue stage lighting.</p>
        {photoProblem && <p role="alert" className="text-sm font-semibold text-chili">{photoProblem}</p>}
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

      <fieldset className="grid gap-4 rounded-sm border-[3px] border-primary p-4">
        <legend className="px-2 text-sm font-bold">Permission</legend>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="permission_on_file" defaultChecked={values.permissionOnFile} className={check} />
          <span>Written permission is on file
            <span className={`block ${help}`}>The artist agreed in writing to appear publicly with their name, photo, and links. Keep the document in your records; this site stores only the date.</span>
          </span>
        </label>
        <div>
          <label htmlFor={`${uid}-pdate`} className={label}>Date permission was given</label>
          <input id={`${uid}-pdate`} name="permission_date" type="date" defaultValue={values.permissionDate} className={field} />
        </div>
      </fieldset>

      <label className="flex items-start gap-3 rounded-sm border-[3px] border-primary p-4">
        <input type="checkbox" name="published" defaultChecked={values.published} className={check} />
        <span className="font-bold">Published
          <span className={`block font-normal ${help}`}>Off = draft, visible only here. On = appears on the public site. Needs permission on file and a photo.</span>
        </span>
      </label>

      <p role="status" aria-live="polite" className="text-sm font-semibold">
        {state.status === "error" && <span className="text-chili">{state.message}</span>}
      </p>
      <button
        type="submit" disabled={pending}
        className="min-h-14 rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop transition-transform hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Saving…" : "Save artist"}
      </button>
    </form>
  );
}
