import { describe, expect, it } from "vitest";
import { splitEvents, toPublicEvent } from "./public";
import type { EventRow } from "./types";

const opts = { tz: "America/Los_Angeles", imageBaseUrl: "https://img.example/e" };
const row = (o: Partial<EventRow> = {}): EventRow => ({
  id: "1", slug: "demo", title: "Demo", description: "", published: true,
  starts_at: "2027-04-11T02:00:00.000Z", date_public: false,
  venue_name: "Secret Room", venue_public: false, ticket_url: null,
  image_path: null, image_alt: null, created_at: "", updated_at: "", ...o,
});

describe("toPublicEvent (the gate)", () => {
  it("hides the date and venue by default, even though they are stored", () => {
    const e = toPublicEvent(row(), opts)!;
    expect(e.startsAt).toBeNull();
    expect(e.dateLabel).toBeNull();
    expect(e.venue).toBeNull();
    expect(JSON.stringify(e)).not.toContain("Secret Room");
    expect(JSON.stringify(e)).not.toContain("2027-04");
  });
  it("shows the date only when date_public is true", () => {
    const e = toPublicEvent(row({ date_public: true }), opts)!;
    expect(e.dateLabel).toBe("Sat, Apr 10, 7:00 PM");
    expect(e.venue).toBeNull();
  });
  it("shows the venue only when venue_public is true", () => {
    const e = toPublicEvent(row({ venue_public: true }), opts)!;
    expect(e.venue).toBe("Secret Room");
    expect(e.dateLabel).toBeNull();
  });
  it("returns nothing for unpublished events", () => {
    expect(toPublicEvent(row({ published: false, date_public: true, venue_public: true }), opts)).toBeNull();
  });
  it("builds the image link and falls back to the title for alt text", () => {
    const e = toPublicEvent(row({ image_path: "a.jpg" }), opts)!;
    expect(e.imageUrl).toBe("https://img.example/e/a.jpg");
    expect(e.imageAlt).toBe("Demo");
  });
});

describe("splitEvents", () => {
  const ev = (slug: string, startsAt: string | null) => toPublicEvent(
    row({ slug, starts_at: startsAt, date_public: startsAt !== null }), opts)!;
  it("puts undated events in upcoming, and only dated past events in the archive", () => {
    const now = new Date("2027-06-01T00:00:00Z");
    const { upcoming, past } = splitEvents(
      [ev("undated", null), ev("old", "2027-01-01T00:00:00Z"), ev("soon", "2027-07-01T00:00:00Z"), ev("later", "2027-09-01T00:00:00Z")], now);
    expect(upcoming.map((e) => e.slug)).toEqual(["soon", "later", "undated"]);
    expect(past.map((e) => e.slug)).toEqual(["old"]);
  });
});
