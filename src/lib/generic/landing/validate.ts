import { isUuid } from "../ids";
import { slugify } from "../slug";

const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export type LandingInput = {
  slug: string;
  headline: string;
  subheadline: string | null;
  body: string | null;
  ctaLabel: string;
  artistId: string | null;
  eventId: string | null;
  imageAlt: string | null;
  removeImage: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  indexInSearch: boolean;
  published: boolean;
};

export function parseLanding(fd: FormData): { ok: true; value: LandingInput } | { ok: false; message: string } {
  const headline = str(fd.get("headline"), 90);
  if (!headline) return { ok: false, message: "Add a headline." };
  const slug = slugify(str(fd.get("slug"), 80) || headline);
  if (!slug) return { ok: false, message: "The web address needs letters or numbers." };
  if (slug === "preview") return { ok: false, message: "That web address is reserved. Pick another." };

  const link = (name: string) => {
    const v = str(fd.get(name), 40);
    return isUuid(v) ? v : null;
  };
  return {
    ok: true,
    value: {
      slug, headline,
      subheadline: str(fd.get("subheadline"), 200) || null,
      body: str(fd.get("body"), 1500) || null,
      ctaLabel: str(fd.get("cta_label"), 30) || "Get first access",
      artistId: link("artist_id"),
      eventId: link("event_id"),
      imageAlt: str(fd.get("image_alt"), 200) || null,
      removeImage: fd.get("remove_image") === "on",
      seoTitle: str(fd.get("seo_title"), 70) || null,
      seoDescription: str(fd.get("seo_description"), 160) || null,
      // checkbox is "Hide from search engines"; stored the other way round
      indexInSearch: fd.get("hide_from_search") !== "on",
      published: fd.get("published") === "on",
    },
  };
}
