import { describe, expect, it } from "vitest";
import { cleanHttpsUrl, parseLinks } from "./links";
import { toPublicArtist } from "./public";
import type { ArtistRow } from "./types";
import { parseArtist } from "./validate";

const fields = (o: Record<string, string>) => (n: string) => o[n] ?? "";
const form = (o: Record<string, string>) => { const fd = new FormData(); for (const [k, v] of Object.entries(o)) fd.set(k, v); return fd; };
const OPTS = { disciplines: ["Music", "Comedy"], today: "2026-10-15" };

describe("links", () => {
  it("accepts only clean https addresses", () => {
    expect(cleanHttpsUrl("https://instagram.com/x")).not.toBeNull();
    expect(cleanHttpsUrl("http://instagram.com/x")).toBeNull();
    expect(cleanHttpsUrl("javascript:alert(1)")).toBeNull();
    expect(cleanHttpsUrl("not a url")).toBeNull();
  });
  it("checks each fixed type against its own site", () => {
    expect(parseLinks(fields({ link_instagram: "https://www.instagram.com/a" })).ok).toBe(true);
    expect(parseLinks(fields({ link_instagram: "https://evil.com/instagram.com" }))).toMatchObject({ ok: false });
    expect(parseLinks(fields({ link_youtube: "https://youtu.be/abc" })).ok).toBe(true);
    expect(parseLinks(fields({ link_website: "https://mysite.com" })).ok).toBe(true);
  });
  it("needs a name for each 'other' link", () => {
    expect(parseLinks(fields({ other_url_0: "https://a.bandcamp.com" }))).toMatchObject({ ok: false });
    const r = parseLinks(fields({ other_label_0: "Bandcamp", other_url_0: "https://a.bandcamp.com" }));
    expect(r).toMatchObject({ ok: true, links: [{ type: "other", label: "Bandcamp" }] });
  });
});

const row = (o: Partial<ArtistRow> = {}): ArtistRow => ({
  id: "1", slug: "a", name: "A", discipline: "Music", neighborhood: null, tagline: null, published: true,
  permission_on_file: true, permission_date: "2026-10-01", image_path: "a.jpg", image_alt: "A on stage",
  links: [{ type: "instagram", url: "https://instagram.com/a" }], created_at: "", updated_at: "", ...o,
});

describe("toPublicArtist (the gate)", () => {
  const opts = { imageBaseUrl: "https://img.example/a" };
  it("shows a fully cleared, published artist and never the permission record", () => {
    const a = toPublicArtist(row(), opts)!;
    expect(a.imageUrl).toBe("https://img.example/a/a.jpg");
    expect(a.links).toEqual([{ label: "Instagram", url: "https://instagram.com/a" }]);
    expect(JSON.stringify(a)).not.toContain("2026-10-01");
  });
  it("hides drafts", () => expect(toPublicArtist(row({ published: false }), opts)).toBeNull());
  it("hides a published artist without permission, a date, or a photo", () => {
    expect(toPublicArtist(row({ permission_on_file: false }), opts)).toBeNull();
    expect(toPublicArtist(row({ permission_date: null }), opts)).toBeNull();
    expect(toPublicArtist(row({ image_path: null }), opts)).toBeNull();
    expect(toPublicArtist(row({ image_alt: "" }), opts)).toBeNull();
  });
});

describe("parseArtist", () => {
  const base = { name: "Sam Rivera", discipline: "Music" };
  it("accepts a name and discipline; everything else defaults to off", () => {
    expect(parseArtist(form(base), OPTS)).toMatchObject({ ok: true, value: { slug: "sam-rivera", published: false, permissionOnFile: false } });
  });
  it("rejects an unknown discipline", () => expect(parseArtist(form({ ...base, discipline: "Mime" }), OPTS)).toMatchObject({ ok: false }));
  it("needs a real, non-future permission date when permission is ticked", () => {
    const on = { ...base, permission_on_file: "on" };
    expect(parseArtist(form(on), OPTS)).toMatchObject({ ok: false });
    expect(parseArtist(form({ ...on, permission_date: "2026-02-31" }), OPTS)).toMatchObject({ ok: false });
    expect(parseArtist(form({ ...on, permission_date: "2027-01-01" }), OPTS)).toMatchObject({ ok: false });
    expect(parseArtist(form({ ...on, permission_date: "2026-10-01" }), OPTS)).toMatchObject({ ok: true, value: { permissionDate: "2026-10-01" } });
  });
});
