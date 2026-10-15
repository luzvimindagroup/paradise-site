"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { TIMEZONE } from "@/config/site";
import { EVENTS_TAG, IMAGE_BUCKET } from "@/lib/events";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { IMAGE_TYPES, checkImage, parseEvent } from "@/lib/generic/events/validate";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export type EventFormState = { status: "idle" } | { status: "error"; message: string };

export async function saveEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  await requireAdmin();
  const fail = (message: string): EventFormState => ({ status: "error", message });

  const parsed = parseEvent(formData, TIMEZONE);
  if (!parsed.ok) return fail(parsed.message);
  const v = parsed.value;

  const id = String(formData.get("id") ?? "") || null;
  const db = createAdminClient();

  let existing: { image_path: string | null; image_alt: string | null } | null = null;
  if (id) {
    const { data } = await db.from("events").select("image_path, image_alt").eq("id", id).maybeSingle();
    if (!data) return fail("That event no longer exists.");
    existing = data;
  }

  // Photo: keep, replace, or remove.
  let imagePath = existing?.image_path ?? null;
  let newUpload: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const problem = checkImage(file);
    if (problem) return fail(problem);
    const path = `${crypto.randomUUID()}.${IMAGE_TYPES[file.type]}`;
    const { error } = await db.storage.from(IMAGE_BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type });
    if (error) return fail("The photo couldn't be uploaded. Please try again.");
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

  const row = {
    slug: v.slug, title: v.title, description: v.description, published: v.published,
    starts_at: v.startsAt, date_public: v.datePublic,
    venue_name: v.venueName, venue_public: v.venuePublic,
    ticket_url: v.ticketUrl, image_path: imagePath, image_alt: imageAlt,
  };
  const { error } = id
    ? await db.from("events").update(row).eq("id", id)
    : await db.from("events").insert(row);

  if (error) {
    if (newUpload) await db.storage.from(IMAGE_BUCKET).remove([newUpload]);
    return fail(error.code === "23505" ? "Another event already uses that web address. Change it." : "Something went wrong saving. Please try again.");
  }

  // Tidy up a photo that was replaced or removed.
  if (existing?.image_path && existing.image_path !== imagePath) {
    await db.storage.from(IMAGE_BUCKET).remove([existing.image_path]);
  }
  updateTag(EVENTS_TAG);
  redirect("/admin/events");
}
