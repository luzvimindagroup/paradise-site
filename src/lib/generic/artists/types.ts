import type { ArtistLink } from "./links";

/** A row of the `artists` table as stored (admin only). */
export type ArtistRow = {
  id: string;
  slug: string;
  name: string;
  discipline: string;
  neighborhood: string | null;
  tagline: string | null;
  published: boolean;
  permission_on_file: boolean;
  permission_date: string | null; // YYYY-MM-DD
  image_path: string | null;
  image_alt: string | null;
  links: ArtistLink[];
  created_at: string;
  updated_at: string;
};

/** What a visitor may see. Never includes the permission record. */
export type PublicArtist = {
  slug: string;
  name: string;
  discipline: string;
  neighborhood: string | null;
  tagline: string | null;
  imageUrl: string;
  imageAlt: string;
  links: { label: string; url: string }[];
};
