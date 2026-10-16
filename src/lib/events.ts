import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { TIMEZONE } from "@/config/site";
import type { FeaturedEvent } from "@/config/featured-event";
import { splitEvents, toPublicEvent } from "@/lib/generic/events/public";
import type { EventRow, PublicEvent } from "@/lib/generic/events/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const EVENTS_TAG = "events"; // saving an event in admin refreshes everything cached under this tag
export const IMAGE_BUCKET = "event-images";

const imageBaseUrl = () => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}`;
const opts = () => ({ tz: TIMEZONE, imageBaseUrl: imageBaseUrl() });

async function loadPublic(): Promise<PublicEvent[]> {
  const { data, error } = await createAdminClient().from("events").select("*").eq("published", true);
  if (error) throw error;
  return (data as EventRow[]).map((r) => toPublicEvent(r, opts())).filter((e): e is PublicEvent => e !== null);
}

/** Public events, split into upcoming and past. Refreshed every ~5 minutes; admin saves refresh it at once. */
export async function getPublicEvents(): Promise<{ upcoming: PublicEvent[]; past: PublicEvent[] }> {
  "use cache";
  cacheTag(EVENTS_TAG);
  // Short, because "upcoming vs past" depends on the clock: an event moves to the archive within ~5 minutes of starting.
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  try {
    return splitEvents(await loadPublic(), new Date());
  } catch {
    cacheLife("minutes"); // retry soon, but long enough to still be prerendered
    return { upcoming: [], past: [] };
  }
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheTag(EVENTS_TAG);
  cacheLife("hours");
  try {
    const { data, error } = await createAdminClient().from("events").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? toPublicEvent(data as EventRow, opts()) : null;
  } catch {
    cacheLife("minutes"); // retry soon
    return null;
  }
}

/** The home-page banner: the next upcoming published event that has a photo. */
export async function getFeaturedEvent(): Promise<FeaturedEvent | null> {
  const { upcoming } = await getPublicEvents();
  const e = upcoming.find((x) => x.imageUrl);
  if (!e?.imageUrl) return null;
  return {
    title: e.title, imageUrl: e.imageUrl, imageAlt: e.imageAlt, published: true,
    datePublic: Boolean(e.dateLabel), dateLabel: e.dateLabel ?? undefined,
    venuePublic: Boolean(e.venue), venueLabel: e.venue ?? undefined,
  };
}
