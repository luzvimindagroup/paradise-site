import type { PublicArtist } from "../artists/types";
import type { PublicEvent } from "../events/types";
import type { LandingRow, PublicLanding } from "./types";

/** The text a search engine shows. Falls back to the page's own words when the SEO boxes are empty. */
export function seoFor(row: Pick<LandingRow, "headline" | "subheadline" | "seo_title" | "seo_description">, fallbackDescription: string) {
  return {
    title: (row.seo_title || row.headline).slice(0, 70),
    description: (row.seo_description || row.subheadline || fallbackDescription).slice(0, 160),
  };
}

/**
 * THE gate for landing pages. A page appears only if it is published AND everything it is linked
 * to is itself public (the artist's permission and photo, the event's published flag). `artist`
 * and `event` must be the results of the artist/event gates (null if not public).
 * If an artist is linked and isn't public, the whole page disappears rather than naming them.
 */
export function toPublicLanding(
  row: LandingRow,
  opts: { imageBaseUrl: string; artist: PublicArtist | null; event: PublicEvent | null; fallbackDescription: string },
): PublicLanding | null {
  if (!row.published) return null;
  if (row.artist_id && !opts.artist) return null;
  if (row.event_id && !opts.event) return null;

  // Hero photo: the page's own, else the linked artist's, else the linked event's, else none (type-only page).
  const own = row.image_path ? { url: `${opts.imageBaseUrl}/${row.image_path}`, alt: row.image_alt || row.headline } : null;
  const hero =
    own ??
    (opts.artist ? { url: opts.artist.imageUrl, alt: opts.artist.imageAlt } : null) ??
    (opts.event?.imageUrl ? { url: opts.event.imageUrl, alt: opts.event.imageAlt } : null);

  const seo = seoFor(row, opts.fallbackDescription);
  return {
    slug: row.slug,
    headline: row.headline,
    subheadline: row.subheadline || null,
    body: row.body || null,
    ctaLabel: row.cta_label,
    imageUrl: hero?.url ?? null,
    imageAlt: hero?.alt ?? row.headline,
    seoTitle: seo.title,
    seoDescription: seo.description,
    indexInSearch: row.index_in_search,
    artist: opts.artist,
    event: opts.event,
  };
}

/** Whether a linked artist/event is public enough for the page to be published. Returns a message if not. */
export function blockedLinks(
  row: Pick<LandingRow, "artist_id" | "event_id">,
  resolved: { artist: PublicArtist | null; event: PublicEvent | null },
): string | null {
  if (row.artist_id && !resolved.artist) return "The linked artist isn't public yet. They need to be published, with written permission and a photo.";
  if (row.event_id && !resolved.event) return "The linked event isn't published yet.";
  return null;
}
