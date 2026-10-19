"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getPublicArtist } from "@/lib/artists";
import { getPublicEvent } from "@/lib/events";
import { LANDING_IMAGE_BUCKET, LANDING_TAG, slugOf } from "@/lib/landing";
import { isUuid } from "@/lib/generic/ids";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { uploadImage } from "@/lib/generic/images/upload";
import { blockedLinks } from "@/lib/generic/landing/public";
import { parseLanding } from "@/lib/generic/landing/validate";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export type LandingFormState = { status: "idle" } | { status: "error"; message: string };

export async function saveLanding(_prev: LandingFormState, formData: FormData): Promise<LandingFormState> {
  await requireAdmin();
  const fail = (message: string): LandingFormState => ({ status: "error", message });

  const parsed = parseLanding(formData);
  if (!parsed.ok) return fail(parsed.message);
  const v = parsed.value;

  const id = String(formData.get("id") ?? "") || null;
  if (id && !isUuid(id)) return fail("That page no longer exists.");
  const db = createAdminClient();

  let existing: { slug: string; image_path: string | null; image_alt: string | null } | null = null;
  if (id) {
    const { data } = await db.from("landing_pages").select("slug, image_path, image_alt").eq("id", id).maybeSingle();
    if (!data) return fail("That page no longer exists.");
    existing = data;
  }

  // Publishing needs everything it links to to be public already.
  if (v.published && (v.artistId || v.eventId)) {
    const [artist, event] = await Promise.all([
      v.artistId ? slugOf("artists", v.artistId).then((s) => (s ? getPublicArtist(s) : null)) : null,
      v.eventId ? slugOf("events", v.eventId).then((s) => (s ? getPublicEvent(s) : null)) : null,
    ]);
    const blocked = blockedLinks({ artist_id: v.artistId, event_id: v.eventId }, { artist, event });
    if (blocked) return fail(blocked);
  }

  let imagePath = existing?.image_path ?? null;
  let newUpload: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(db, LANDING_IMAGE_BUCKET, file);
    if (!up.ok) return fail(up.message);
    newUpload = up.path;
    imagePath = up.path;
  } else if (v.removeImage) {
    imagePath = null;
  }
  const imageAlt = imagePath ? (v.imageAlt ?? existing?.image_alt ?? null) : null;
  const discard = async () => { if (newUpload) await db.storage.from(LANDING_IMAGE_BUCKET).remove([newUpload]); };
  if (imagePath && !imageAlt) {
    await discard();
    return fail("Describe the photo in a few words (alt text) so everyone can follow it.");
  }

  // Leaving the web address blank while editing keeps the current one (so shared ad links never break).
  const slug = existing && !String(formData.get("slug") ?? "").trim() ? existing.slug : v.slug;
  const row = {
    slug, published: v.published, headline: v.headline, subheadline: v.subheadline, body: v.body,
    cta_label: v.ctaLabel, artist_id: v.artistId, event_id: v.eventId,
    image_path: imagePath, image_alt: imageAlt,
    seo_title: v.seoTitle, seo_description: v.seoDescription, index_in_search: v.indexInSearch,
  };
  const { data: saved, error } = id
    ? await db.from("landing_pages").update(row).eq("id", id).select("id").maybeSingle()
    : await db.from("landing_pages").insert(row).select("id").maybeSingle();

  if (error || !saved) {
    await discard();
    if (!error) return fail("That page no longer exists.");
    return fail(error.code === "23505" ? "Another page already uses that web address. Change it." : "Something went wrong saving. Please try again.");
  }

  if (existing?.image_path && existing.image_path !== imagePath) {
    const { error: rmError } = await db.storage.from(LANDING_IMAGE_BUCKET).remove([existing.image_path]);
    if (rmError) console.error(`Could not delete old landing photo ${existing.image_path}`);
  }
  updateTag(LANDING_TAG);
  redirect("/admin/landing-pages");
}

