"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { DISCIPLINES } from "@/config/artists";
import { ARTISTS_TAG, ARTIST_IMAGE_BUCKET } from "@/lib/artists";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { missingForPublishing } from "@/lib/generic/artists/public";
import { parseArtist } from "@/lib/generic/artists/validate";
import { uploadImage } from "@/lib/generic/images/upload";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export type ArtistFormState = { status: "idle" } | { status: "error"; message: string };

export async function saveArtist(_prev: ArtistFormState, formData: FormData): Promise<ArtistFormState> {
  await requireAdmin();
  const fail = (message: string): ArtistFormState => ({ status: "error", message });

  const today = new Date().toISOString().slice(0, 10);
  const parsed = parseArtist(formData, { disciplines: DISCIPLINES, today });
  if (!parsed.ok) return fail(parsed.message);
  const v = parsed.value;

  const id = String(formData.get("id") ?? "") || null;
  if (id && !/^[0-9a-f-]{36}$/.test(id)) return fail("That artist no longer exists.");
  const db = createAdminClient();

  let existing: { image_path: string | null; image_alt: string | null } | null = null;
  if (id) {
    const { data } = await db.from("artists").select("image_path, image_alt").eq("id", id).maybeSingle();
    if (!data) return fail("That artist no longer exists.");
    existing = data;
  }

  // Photo: keep, replace, or remove.
  let imagePath = existing?.image_path ?? null;
  let newUpload: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(db, ARTIST_IMAGE_BUCKET, file);
    if (!up.ok) return fail(up.message);
    newUpload = up.path;
    imagePath = up.path;
  } else if (v.removeImage) {
    imagePath = null;
  }
  const imageAlt = imagePath ? (v.imageAlt ?? existing?.image_alt ?? null) : null;
  const discard = async () => { if (newUpload) await db.storage.from(ARTIST_IMAGE_BUCKET).remove([newUpload]); };

  if (imagePath && !imageAlt) {
    await discard();
    return fail("Describe the photo in a few words (alt text) so everyone can follow it.");
  }
  if (v.published) {
    const blocked = missingForPublishing({
      permissionOnFile: v.permissionOnFile, permissionDate: v.permissionDate,
      hasImage: Boolean(imagePath), hasAlt: Boolean(imageAlt),
    });
    if (blocked) { await discard(); return fail(blocked); }
  }

  const row = {
    slug: v.slug, name: v.name, discipline: v.discipline, neighborhood: v.neighborhood, tagline: v.tagline,
    published: v.published, permission_on_file: v.permissionOnFile, permission_date: v.permissionDate,
    image_path: imagePath, image_alt: imageAlt, links: v.links,
  };
  const { data: saved, error } = id
    ? await db.from("artists").update(row).eq("id", id).select("id").maybeSingle()
    : await db.from("artists").insert(row).select("id").maybeSingle();

  if (error || !saved) {
    await discard();
    if (!error) return fail("That artist no longer exists.");
    return fail(error.code === "23505" ? "Another artist already uses that web address. Change it." : "Something went wrong saving. Please try again.");
  }

  if (existing?.image_path && existing.image_path !== imagePath) {
    await db.storage.from(ARTIST_IMAGE_BUCKET).remove([existing.image_path]);
  }
  updateTag(ARTISTS_TAG);
  redirect("/admin/artists");
}
