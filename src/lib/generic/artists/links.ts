import { cleanHttpsUrl } from "../url";
export { cleanHttpsUrl };

// Fixed link types for the big platforms, plus "other" (with its own label) for everything else.
export type LinkType =
  | "instagram" | "tiktok" | "youtube" | "spotify" | "apple_music" | "soundcloud" | "facebook" | "website" | "other";

export type ArtistLink = { type: LinkType; label?: string; url: string };

/** The fixed types in display order. `hosts` = web domains a link of that type must belong to (none = any). */
export const FIXED_LINK_TYPES: { type: Exclude<LinkType, "other">; label: string; hosts: string[] }[] = [
  { type: "instagram", label: "Instagram", hosts: ["instagram.com"] },
  { type: "tiktok", label: "TikTok", hosts: ["tiktok.com"] },
  { type: "youtube", label: "YouTube", hosts: ["youtube.com", "youtu.be"] },
  { type: "spotify", label: "Spotify", hosts: ["spotify.com"] },
  { type: "apple_music", label: "Apple Music", hosts: ["music.apple.com"] },
  { type: "soundcloud", label: "SoundCloud", hosts: ["soundcloud.com"] },
  { type: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.com", "fb.me"] },
  { type: "website", label: "Website", hosts: [] },
];
export const OTHER_LINK_SLOTS = 3;

const onHost = (url: string, hosts: string[]) => {
  const h = new URL(url).hostname.toLowerCase();
  return hosts.some((d) => h === d || h.endsWith("." + d));
};

export type LinkResult = { ok: true; links: ArtistLink[] } | { ok: false; message: string };

/** `get(name)` reads form fields: link_<type>, other_label_<n>, other_url_<n>. */
export function parseLinks(get: (name: string) => string): LinkResult {
  const links: ArtistLink[] = [];
  for (const t of FIXED_LINK_TYPES) {
    const raw = get(`link_${t.type}`).trim();
    if (!raw) continue;
    const url = cleanHttpsUrl(raw);
    if (!url) return { ok: false, message: `${t.label}: use a full https:// address.` };
    if (t.hosts.length && !onHost(url, t.hosts)) return { ok: false, message: `${t.label}: that doesn't look like a ${t.label} address.` };
    links.push({ type: t.type, url });
  }
  for (let i = 0; i < OTHER_LINK_SLOTS; i++) {
    const raw = get(`other_url_${i}`).trim();
    const label = get(`other_label_${i}`).trim().slice(0, 40);
    if (!raw && !label) continue;
    if (!label) return { ok: false, message: "Give each \"Other\" link a name (like Bandcamp)." };
    const url = cleanHttpsUrl(raw);
    if (!url) return { ok: false, message: `${label}: use a full https:// address.` };
    links.push({ type: "other", label, url });
  }
  // The same address twice is just clutter: keep the first.
  const seen = new Set<string>();
  return { ok: true, links: links.filter((l) => (seen.has(l.url) ? false : (seen.add(l.url), true))) };
}

export const linkLabel = (l: ArtistLink) =>
  l.type === "other" ? (l.label ?? "Link") : FIXED_LINK_TYPES.find((t) => t.type === l.type)?.label ?? "Link";
