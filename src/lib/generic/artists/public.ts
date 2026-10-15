import { linkLabel } from "./links";
import type { ArtistRow, PublicArtist } from "./types";

/** Everything an artist needs before they may appear publicly. Used by the form, the gate, and mirrored by the database. */
export function missingForPublishing(a: {
  permissionOnFile: boolean;
  permissionDate: string | null;
  hasImage: boolean;
  hasAlt: boolean;
}): string | null {
  if (!a.permissionOnFile || !a.permissionDate) return "An artist can only be published with written permission on file (and its date).";
  if (!a.hasImage) return "An artist can only be published with their photo.";
  if (!a.hasAlt) return "Describe the photo in a few words (alt text) before publishing.";
  return null;
}

/**
 * THE gate for artists. Every public page gets artists through this function. Even if a row is
 * marked published, it returns nothing unless permission and a photo are on record.
 */
export function toPublicArtist(row: ArtistRow, opts: { imageBaseUrl: string }): PublicArtist | null {
  if (!row.published) return null;
  const blocked = missingForPublishing({
    permissionOnFile: row.permission_on_file,
    permissionDate: row.permission_date,
    hasImage: Boolean(row.image_path),
    hasAlt: Boolean(row.image_alt),
  });
  if (blocked) return null;
  return {
    slug: row.slug,
    name: row.name,
    discipline: row.discipline,
    neighborhood: row.neighborhood || null,
    tagline: row.tagline || null,
    imageUrl: `${opts.imageBaseUrl}/${row.image_path}`,
    imageAlt: row.image_alt!,
    links: (row.links ?? []).map((l) => ({ label: linkLabel(l), url: l.url })),
  };
}
