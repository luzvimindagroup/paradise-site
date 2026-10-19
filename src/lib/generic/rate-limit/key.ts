import { createHash } from "node:crypto";

/** The visitor's network address as the hosting platform reports it. Null when unknown. */
export function clientIp(get: (name: string) => string | null): string | null {
  const fwd = get("x-forwarded-for");
  const first = fwd?.split(",")[0]?.trim();
  return first || get("x-real-ip")?.trim() || null;
}

/**
 * A scrambled, one-way key for a visitor and purpose. The raw address is never stored.
 * `salt` comes from the environment so the hashes can't be reversed with a lookup table.
 */
export function limitKey(purpose: string, subject: string, salt: string): string {
  const digest = createHash("sha256").update(`${salt}|${purpose}|${subject.toLowerCase()}`).digest("hex").slice(0, 32);
  return `${purpose}:${digest}`;
}
