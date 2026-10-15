import { describe, expect, it } from "vitest";
import { checkImage, parseEvent, slugify } from "./validate";

const TZ = "America/Los_Angeles";
const form = (o: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) fd.set(k, v);
  return fd;
};

describe("slugify", () => {
  it("makes a clean web address", () => {
    expect(slugify("Paradise Sessions: Vol. 1!")).toBe("paradise-sessions-vol-1");
    expect(slugify("Café Noche")).toBe("cafe-noche");
  });
});

describe("parseEvent", () => {
  it("accepts a title alone and defaults everything public to off", () => {
    const r = parseEvent(form({ title: "Vol 1" }), TZ);
    expect(r).toMatchObject({ ok: true, value: { slug: "vol-1", published: false, datePublic: false, venuePublic: false } });
  });
  it("converts the typed Pacific time to UTC", () => {
    const r = parseEvent(form({ title: "A", starts_at: "2027-04-10T19:00" }), TZ);
    expect(r.ok && r.value.startsAt).toBe("2027-04-11T02:00:00.000Z");
  });
  it("won't make a missing date or venue public", () => {
    expect(parseEvent(form({ title: "A", date_public: "on" }), TZ)).toMatchObject({ ok: false });
    expect(parseEvent(form({ title: "A", venue_public: "on" }), TZ)).toMatchObject({ ok: false });
  });
  it("requires an https ticket link", () => {
    expect(parseEvent(form({ title: "A", ticket_url: "http://x.com" }), TZ)).toMatchObject({ ok: false });
    expect(parseEvent(form({ title: "A", ticket_url: "https://x.com/t" }), TZ)).toMatchObject({ ok: true });
  });
});

describe("checkImage", () => {
  it("allows small jpg/png/webp only", () => {
    expect(checkImage({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(checkImage({ type: "image/gif", size: 1000 })).not.toBeNull();
    expect(checkImage({ type: "image/png", size: 6 * 1024 * 1024 })).not.toBeNull();
  });
});
