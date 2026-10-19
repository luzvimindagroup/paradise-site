"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { TIMEZONE } from "@/config/site";
import { EVENTS_TAG, IMAGE_BUCKET } from "@/lib/events";
import { isUuid } from "@/lib/generic/ids";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { parseEvent } from "@/lib/generic/events/validate";
import { uploadImage } from "@/lib/generic/images/upload";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export type EventFormState = { status: "idle" } | { status: "error"; message: string };

export async function saveEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  await requireAdmin();
  const fail = (message: string): EventFormState => ({ status: "error", message });

  const parsed = parseEvent(formData, TIMEZONE);
  if (!parsed.ok) return fail(parsed.message);
  const v = parsed.value;

  const id = String(formData.get("id") ?? "") || null;
  if (id && !isUuid(id)) return fail("That event no longer exists.");
  const db = createAdminClient();

  let existing: { slug: string; image_path: string | null; image_alt: string | null } | null = null;
  if (id) {
    const { data } = await db.from("events").select("slug, image_path, image_alt").eq("id", id).maybeSingle();
    if (!data) return fail("That event no longer exists.");
    existing = data;
  }

  // Photo: keep, replace, or remove.
  let imagePath = existing?.image_path ?? null;
  let newUpload: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(db, IMAGE_BUCKET, file);
    if (!up.ok) return fail(up.message);
    const path = up.path;
    newUpload = path;
    imagePath = path;
  } else if (v.removeImage) {
    imagePath = null;
  }
  const imageAlt = imagePath ? (v.imageAlt ?? existing?.image_alt ?? null) : null;
  if (imagePath && !imageAlt) {
    if (newUpload) await db.storage.from(IMAGE_BUCKET).remove([newUpload]);
    return fail("Describe the photo in a few words (alt text) so everyone can follow it.");
  }

  // Leaving the web address blank while editing keeps the current one (so shared links never break).
  const slug = existing && !String(formData.get("slug") ?? "").trim() ? existing.slug : v.slug;
  const row = {
    slug, title: v.title, description: v.description, published: v.published,
    starts_at: v.startsAt, date_public: v.datePublic,
    venue_name: v.venueName, venue_public: v.venuePublic,
    ticket_url: v.ticketUrl, image_path: imagePath, image_alt: imageAlt,
  };
  const { data: saved, error } = id
    ? await db.from("events").update(row).eq("id", id).select("id").maybeSingle()
    : await db.from("events").insert(row).select("id").maybeSingle();

  if (error || !saved) {
    if (newUpload) await db.storage.from(IMAGE_BUCKET).remove([newUpload]);
    if (!error) return fail("That event no longer exists.");
    return fail(error.code === "23505" ? "Another event already uses that web address. Change it." : "Something went wrong saving. Please try again.");
  }

  // Tidy up a photo that was replaced or removed.
  if (existing?.image_path && existing.image_path !== imagePath) {
    const { error: rmError } = await db.storage.from(IMAGE_BUCKET).remove([existing.image_path]);
    if (rmError) console.error(`Could not delete old event photo ${existing.image_path}`);
  }
  updateTag(EVENTS_TAG);
  redirect("/admin/events");
}
