import { createHash } from "node:crypto";

/**
 * The visitor's network address as the hosting platform reports it. Null when unknown.
 * Prefers headers the platform itself sets (Vercel: x-real-ip); the first x-forwarded-for entry
 * is a fallback only, since a client can forge it behind a proxy that appends rather than replaces.
 */
export function clientIp(get: (name: string) => string | null): string | null {
  const trusted = get("x-real-ip")?.trim() || get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (trusted) return trusted;
  return get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

/**
 * A scrambled, one-way key for a visitor and purpose. The raw address is never stored.
 * `salt` comes from the environment so the hashes can't be reversed with a lookup table.
 */
export function limitKey(purpose: string, subject: string, salt: string): string {
  const digest = createHash("sha256").update(`${salt}|${purpose}|${subject.toLowerCase()}`).digest("hex").slice(0, 32);
  return `${purpose}:${digest}`;
}
