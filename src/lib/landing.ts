import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SITE } from "@/config/site";
import { ARTISTS_TAG, getPublicArtist } from "@/lib/artists";
import { EVENTS_TAG, getPublicEvent } from "@/lib/events";
import { toPublicLanding } from "@/lib/generic/landing/public";
import type { LandingRow, PublicLanding } from "@/lib/generic/landing/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const LANDING_TAG = "landing";
export const LANDING_IMAGE_BUCKET = "landing-images";

export const landingImageBase = () =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${LANDING_IMAGE_BUCKET}`;

const fallbackDescription = `${SITE.series}: Filipino-American live talent in ${SITE.market}.`;

/** A published landing page, only if everything it links to is public too. Refreshes when landing pages, artists, or events change. */
export async function getPublicLanding(slug: string): Promise<PublicLanding | null> {
  "use cache";
  cacheTag(LANDING_TAG, ARTISTS_TAG, EVENTS_TAG);
  cacheLife("hours");
  try {
    const { data, error } = await createAdminClient().from("landing_pages").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as LandingRow;
    // The linked artist/event go through their own gates, so an unpermitted artist can never show up here.
    const [artist, event] = await Promise.all([
      row.artist_id ? slugOf("artists", row.artist_id).then((s) => (s ? getPublicArtist(s) : null)) : null,
      row.event_id ? slugOf("events", row.event_id).then((s) => (s ? getPublicEvent(s) : null)) : null,
    ]);
    return toPublicLanding(row, { imageBaseUrl: landingImageBase(), artist, event, fallbackDescription });
  } catch {
    cacheLife("minutes"); // retry soon
    return null;
  }
}

async function slugOf(table: "artists" | "events", id: string): Promise<string | null> {
  const { data } = await createAdminClient().from(table).select("slug").eq("id", id).maybeSingle();
  return (data as { slug: string } | null)?.slug ?? null;
}

/** Slugs of landing pages that are live (for sitemap and for pre-building). */
export async function getPublishedLandingSlugs(): Promise<{ slug: string; updatedAt: string; indexInSearch: boolean }[]> {
  "use cache";
  cacheTag(LANDING_TAG, ARTISTS_TAG, EVENTS_TAG);
  cacheLife("hours");
  try {
    const { data, error } = await createAdminClient().from("landing_pages").select("slug, updated_at, index_in_search").eq("published", true);
    if (error) throw error;
    const live: { slug: string; updatedAt: string; indexInSearch: boolean }[] = [];
    for (const r of data as { slug: string; updated_at: string; index_in_search: boolean }[]) {
      if (await getPublicLanding(r.slug)) live.push({ slug: r.slug, updatedAt: r.updated_at, indexInSearch: r.index_in_search });
    }
    return live;
  } catch {
    cacheLife("minutes");
    return [];
  }
}
