import { describe, expect, it } from "vitest";
import { looksLikeBot, parseSignup, parseWelcome } from "./validate";

const form = (o: Record<string, string | string[]>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) (Array.isArray(v) ? v : [v]).forEach((x) => fd.append(k, x));
  return fd;
};
const good = { email: "fan@example.com", zip: "91950", consent: "on" };

describe("parseSignup", () => {
  it("accepts email + ZIP + consent and assumes English", () => {
    const r = parseSignup(form(good));
    expect(r.ok && r.value.language).toBe("English");
    expect(r.ok && r.value.languageAssumed).toBe(true);
  });
  it("keeps a valid chosen language", () => {
    const r = parseSignup(form({ ...good, language: "Tagalog" }));
    expect(r.ok && r.value.language).toBe("Tagalog");
    expect(r.ok && r.value.languageAssumed).toBe(false);
  });
  it("rejects a bad email, bad ZIP, and missing consent", () => {
    expect(parseSignup(form({ ...good, email: "nope" }))).toMatchObject({ ok: false, error: { field: "email" } });
    expect(parseSignup(form({ ...good, zip: "9195" }))).toMatchObject({ ok: false, error: { field: "zip" } });
    expect(parseSignup(form({ ...good, zip: "9195a" }))).toMatchObject({ ok: false, error: { field: "zip" } });
    expect(parseSignup(form({ email: good.email, zip: good.zip }))).toMatchObject({ ok: false, error: { field: "consent" } });
  });
  it("ignores an unknown language and cleans the source slug", () => {
    const r = parseSignup(form({ ...good, language: "Klingon", source: "Home Page!!" }));
    expect(r.ok && r.value.language).toBe("English");
    expect(r.ok && r.value.sourceSlug).toBe("HomePage");
  });
});

describe("looksLikeBot", () => {
  it("flags a filled honeypot", () => expect(looksLikeBot(form({ company: "Acme" }))).toBe(true));
  it("flags an instant submit", () => {
    const now = Date.now();
    expect(looksLikeBot(form({ started_at: String(now - 200) }), now)).toBe(true);
  });
  it("lets a normal submit through", () => {
    const now = Date.now();
    expect(looksLikeBot(form({ started_at: String(now - 8000) }), now)).toBe(false);
    expect(looksLikeBot(form({}), now)).toBe(false);
  });
});

describe("parseWelcome", () => {
  it("accepts all-empty answers", () => expect(parseWelcome(form({})).ok).toBe(true));
  it("keeps only known genres and strips @ from Instagram", () => {
    const r = parseWelcome(form({ genres: ["Comedy", "Polka"], instagram: "@example.handle" }));
    expect(r.ok && r.value.genres).toEqual(["Comedy"]);
    expect(r.ok && r.value.instagram).toBe("example.handle");
  });
  it("rejects a bad Instagram handle", () => {
    expect(parseWelcome(form({ instagram: "bad handle!" })).ok).toBe(false);
  });
});
