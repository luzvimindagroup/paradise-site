import type { PublicArtist } from "../artists/types";
import type { PublicEvent } from "../events/types";

/** A row of the `landing_pages` table as stored (admin only). */
export type LandingRow = {
  id: string;
  slug: string;
  published: boolean;
  headline: string;
  subheadline: string | null;
  body: string | null;
  cta_label: string;
  artist_id: string | null;
  event_id: string | null;
  image_path: string | null;
  image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  index_in_search: boolean;
  created_at: string;
  updated_at: string;
};

/** What a visitor sees. `artist` / `event` are the already-gated public versions, if the page is linked to one. */
export type PublicLanding = {
  slug: string;
  headline: string;
  subheadline: string | null;
  body: string | null;
  ctaLabel: string;
  imageUrl: string | null;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  indexInSearch: boolean;
  artist: PublicArtist | null;
  event: PublicEvent | null;
};
