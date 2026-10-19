import { describe, expect, it } from "vitest";
import { clientIp, limitKey } from "./key";

describe("clientIp", () => {
  it("prefers the platform header, then the first forwarded address, else null", () => {
    expect(clientIp((n) => (n === "x-forwarded-for" ? "203.0.113.5, 10.0.0.1" : null))).toBe("203.0.113.5");
    // the platform's own header wins over a forwarded list a client could forge
    expect(clientIp((n) => ({ "x-real-ip": "198.51.100.9", "x-forwarded-for": "1.1.1.1" })[n] ?? null)).toBe("198.51.100.9");
    expect(clientIp((n) => (n === "x-real-ip" ? "198.51.100.7" : null))).toBe("198.51.100.7");
    expect(clientIp(() => null)).toBeNull();
  });
});

describe("limitKey", () => {
  it("is stable, scrambled, and salted", () => {
    const a = limitKey("signup", "203.0.113.5", "salt-a");
    expect(a).toBe(limitKey("signup", "203.0.113.5", "salt-a"));
    expect(a).not.toContain("203.0.113.5");
    expect(a).not.toBe(limitKey("signup", "203.0.113.5", "salt-b"));
    expect(a).not.toBe(limitKey("contact", "203.0.113.5", "salt-a"));
  });
  it("treats emails case-insensitively", () => {
    expect(limitKey("login", "A@X.com", "s")).toBe(limitKey("login", "a@x.com", "s"));
  });
});
