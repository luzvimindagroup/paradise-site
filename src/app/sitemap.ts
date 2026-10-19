import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, SITE } from "@/config/site";
import { getPublicArtists } from "@/lib/artists";
import { getPublicEvents } from "@/lib/events";
import { getPublishedLandingSlugs } from "@/lib/landing";

// The list of pages we want search engines to know about. Empty while the site is still hidden (pre-launch).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!ALLOW_INDEXING) return [];
  const base = `https://${SITE.domain}`;
  const [{ upcoming, past }, artists, landing] = await Promise.all([getPublicEvents(), getPublicArtists(), getPublishedLandingSlugs()]);
  return [
    ...["", "/join", "/about", "/contact", "/events", "/artists"].map((p) => ({ url: `${base}${p}` })),
    ...[...upcoming, ...past].map((e) => ({ url: `${base}/events/${e.slug}` })),
    ...artists.map((a) => ({ url: `${base}/artists/${a.slug}` })),
    ...landing.filter((l) => l.indexInSearch).map((l) => ({ url: `${base}/l/${l.slug}`, lastModified: l.updatedAt })),
  ];
}
