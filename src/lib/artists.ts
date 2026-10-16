import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { toPublicArtist } from "@/lib/generic/artists/public";
import type { ArtistRow, PublicArtist } from "@/lib/generic/artists/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const ARTISTS_TAG = "artists"; // saving an artist in admin refreshes everything cached under this tag
export const ARTIST_IMAGE_BUCKET = "artist-images";

export const artistImageBase = () =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${ARTIST_IMAGE_BUCKET}`;

/** Published, cleared artists, A to Z. Cached; admin saves refresh it at once. */
export async function getPublicArtists(): Promise<PublicArtist[]> {
  "use cache";
  cacheTag(ARTISTS_TAG);
  cacheLife("hours");
  try {
    const { data, error } = await createAdminClient().from("artists").select("*").eq("published", true).order("name");
    if (error) throw error;
    return (data as ArtistRow[])
      .map((r) => toPublicArtist(r, { imageBaseUrl: artistImageBase() }))
      .filter((a): a is PublicArtist => a !== null);
  } catch {
    cacheLife("minutes"); // retry soon
    return [];
  }
}

export async function getPublicArtist(slug: string): Promise<PublicArtist | null> {
  "use cache";
  cacheTag(ARTISTS_TAG);
  cacheLife("hours");
  try {
    const { data, error } = await createAdminClient().from("artists").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? toPublicArtist(data as ArtistRow, { imageBaseUrl: artistImageBase() }) : null;
  } catch {
    cacheLife("minutes");
    return null;
  }
}
