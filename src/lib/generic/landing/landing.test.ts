import { describe, expect, it } from "vitest";
import type { PublicArtist } from "../artists/types";
import type { PublicEvent } from "../events/types";
import { landingJsonLd, jsonLdString } from "./jsonld";
import { blockedLinks, seoFor, toPublicLanding } from "./public";
import type { LandingRow } from "./types";
import { parseLanding } from "./validate";

const row = (o: Partial<LandingRow> = {}): LandingRow => ({
  id: "1", slug: "demo", published: true, headline: "Hear it first", subheadline: "Sub", body: null,
  cta_label: "Get first access", artist_id: null, event_id: null, image_path: null, image_alt: null,
  seo_title: null, seo_description: null, index_in_search: true, created_at: "", updated_at: "", ...o,
});
const artist: PublicArtist = { slug: "a", name: "A", discipline: "Music", neighborhood: null, tagline: null, imageUrl: "https://img/a.jpg", imageAlt: "A", links: [] };
const event: PublicEvent = { slug: "e", title: "E", description: "", startsAt: null, dateLabel: null, venue: null, ticketUrl: null, imageUrl: "https://img/e.jpg", imageAlt: "E" };
const base = { imageBaseUrl: "https://img/l", artist: null, event: null, fallbackDescription: "fallback" };
const form = (o: Record<string, string>) => { const fd = new FormData(); for (const [k, v] of Object.entries(o)) fd.set(k, v); return fd; };

describe("toPublicLanding (the gate)", () => {
  it("hides drafts", () => expect(toPublicLanding(row({ published: false }), base)).toBeNull());
  it("disappears if its linked artist is not public", () => {
    expect(toPublicLanding(row({ artist_id: "x".repeat(36) }), base)).toBeNull();
    expect(toPublicLanding(row({ artist_id: "x".repeat(36) }), { ...base, artist })).not.toBeNull();
  });
  it("disappears if its linked event is not public", () => {
    expect(toPublicLanding(row({ event_id: "x".repeat(36) }), base)).toBeNull();
  });
  it("picks the hero photo: own, then artist, then event, else none", () => {
    expect(toPublicLanding(row({ image_path: "p.jpg" }), { ...base, artist })!.imageUrl).toBe("https://img/l/p.jpg");
    expect(toPublicLanding(row({ artist_id: "x".repeat(36) }), { ...base, artist })!.imageUrl).toBe("https://img/a.jpg");
    expect(toPublicLanding(row({ event_id: "x".repeat(36) }), { ...base, event })!.imageUrl).toBe("https://img/e.jpg");
    expect(toPublicLanding(row(), base)!.imageUrl).toBeNull();
  });
});

describe("blockedLinks", () => {
  it("explains what is missing", () => {
    expect(blockedLinks({ artist_id: "x", event_id: null }, { artist: null, event: null })).toMatch(/artist/);
    expect(blockedLinks({ artist_id: null, event_id: null }, { artist: null, event: null })).toBeNull();
  });
});

describe("search text", () => {
  it("uses the SEO boxes, else the headline and subheadline, trimmed to search-result length", () => {
    expect(seoFor(row(), "f")).toEqual({ title: "Hear it first", description: "Sub" });
    expect(seoFor(row({ seo_title: "T", seo_description: "D" }), "f")).toEqual({ title: "T", description: "D" });
    expect(seoFor(row({ subheadline: null }), "fallback").description).toBe("fallback");
    expect(seoFor(row({ seo_description: "x".repeat(300) }), "f").description).toHaveLength(160);
  });
});

describe("structured data", () => {
  const page = toPublicLanding(row(), base)!;
  it("always describes the page", () => {
    expect(landingJsonLd(page, "https://x.com", "Site")[0]).toMatchObject({ "@type": "WebPage", url: "https://x.com/l/demo" });
  });
  it("describes an Event only when both date and venue are public", () => {
    const hidden = toPublicLanding(row({ event_id: "x".repeat(36) }), { ...base, event })!;
    expect(landingJsonLd(hidden, "https://x.com", "S")).toHaveLength(1);
    const shown = toPublicLanding(row({ event_id: "x".repeat(36) }), { ...base, event: { ...event, startsAt: "2027-04-11T02:00:00Z", venue: "Room" } })!;
    expect(landingJsonLd(shown, "https://x.com", "S")).toHaveLength(2);
  });
  it("can't be broken out of its script tag", () => {
    expect(jsonLdString({ a: "</script><b>" })).not.toContain("</script>");
  });
});

describe("parseLanding", () => {
  it("needs a headline; defaults are safe", () => {
    expect(parseLanding(form({}))).toMatchObject({ ok: false });
    expect(parseLanding(form({ headline: "Hear It First" }))).toMatchObject({
      ok: true, value: { slug: "hear-it-first", published: false, indexInSearch: true, ctaLabel: "Get first access" },
    });
  });
  it("ignores a link that isn't a real id and reserves 'preview'", () => {
    expect(parseLanding(form({ headline: "H", artist_id: "nope" }))).toMatchObject({ ok: true, value: { artistId: null } });
    expect(parseLanding(form({ headline: "H", slug: "preview" }))).toMatchObject({ ok: false });
  });
  it("hide-from-search turns indexing off", () => {
    expect(parseLanding(form({ headline: "H", hide_from_search: "on" }))).toMatchObject({ ok: true, value: { indexInSearch: false } });
  });
});
