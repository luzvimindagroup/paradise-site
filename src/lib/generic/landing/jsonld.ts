import type { PublicLanding } from "./types";

/** Structured data (JSON-LD) that tells search engines what a page is. `origin` is like "https://example.com". */
export function landingJsonLd(page: PublicLanding, origin: string, siteName: string): Record<string, unknown>[] {
  const url = `${origin}/l/${page.slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.seoTitle,
      description: page.seoDescription,
      url,
      isPartOf: { "@type": "WebSite", name: siteName, url: origin },
      ...(page.imageUrl ? { primaryImageOfPage: { "@type": "ImageObject", url: page.imageUrl } } : {}),
    },
  ];
  const e = page.event;
  // An Event is only described when BOTH its date and venue are public (search engines need both; never reveal one without the other's flag).
  if (e && e.startsAt && e.venue) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.title,
      startDate: e.startsAt,
      location: { "@type": "Place", name: e.venue },
      ...(e.imageUrl ? { image: [e.imageUrl] } : {}),
      url,
    });
  }
  return graph;
}

/** JSON for a <script type="application/ld+json"> tag. "<" is escaped so the text can never close the tag early. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
