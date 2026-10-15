import { describe, expect, it } from "vitest";
import { parseContact } from "./validate";

const CATS = ["General", "Press"] as const;
const form = (o: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) fd.set(k, v);
  return fd;
};
const good = { category: "General", name: "Sam", email: "sam@example.com", message: "Hello there, friend." };

describe("parseContact", () => {
  it("accepts a complete message", () => {
    expect(parseContact(form(good), CATS).ok).toBe(true);
  });
  it("rejects an unknown category", () => {
    const r = parseContact(form({ ...good, category: "Sponsor" }), CATS);
    expect(r).toMatchObject({ ok: false, field: "category" });
  });
  it("rejects a bad email and a too-short message", () => {
    expect(parseContact(form({ ...good, email: "nope" }), CATS)).toMatchObject({ ok: false, field: "email" });
    expect(parseContact(form({ ...good, message: "hi" }), CATS)).toMatchObject({ ok: false, field: "message" });
  });
});
