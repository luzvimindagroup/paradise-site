/** An https web address, or null. Rejects http, javascript:, embedded passwords (user:pass@host), and anything that isn't a clean URL. */
export function cleanHttpsUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" || !u.hostname.includes(".") || u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}
