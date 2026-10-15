import { zonedToUtcIso } from "./zoned";

const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export type EventInput = {
  slug: string;
  title: string;
  description: string;
  published: boolean;
  startsAt: string | null;
  datePublic: boolean;
  venueName: string | null;
  venuePublic: boolean;
  ticketUrl: string | null;
  imageAlt: string | null;
  removeImage: boolean;
};

export function parseEvent(fd: FormData, tz: string): { ok: true; value: EventInput } | { ok: false; message: string } {
  const title = str(fd.get("title"), 120);
  if (!title) return { ok: false, message: "Add a title." };

  const slug = slugify(str(fd.get("slug"), 80) || title);
  if (!slug) return { ok: false, message: "The web address needs letters or numbers." };

  const dateText = str(fd.get("starts_at"), 20);
  const startsAt = dateText ? zonedToUtcIso(dateText, tz) : null;
  if (dateText && !startsAt) return { ok: false, message: "That date and time isn't valid." };

  const datePublic = fd.get("date_public") === "on";
  if (datePublic && !startsAt) return { ok: false, message: "Add a date before making it public." };

  const venueName = str(fd.get("venue_name"), 120) || null;
  const venuePublic = fd.get("venue_public") === "on";
  if (venuePublic && !venueName) return { ok: false, message: "Add a venue name before making it public." };

  const ticketRaw = str(fd.get("ticket_url"), 300);
  let ticketUrl: string | null = null;
  if (ticketRaw) {
    try {
      const u = new URL(ticketRaw);
      if (u.protocol !== "https:") throw new Error();
      ticketUrl = u.toString();
    } catch {
      return { ok: false, message: "The ticket link must be a full https:// address." };
    }
  }

  return {
    ok: true,
    value: {
      slug, title,
      description: str(fd.get("description"), 4000),
      published: fd.get("published") === "on",
      startsAt, datePublic, venueName, venuePublic, ticketUrl,
      imageAlt: str(fd.get("image_alt"), 200) || null,
      removeImage: fd.get("remove_image") === "on",
    },
  };
}

export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel rejects requests over 4.5 MB

export function checkImage(file: { type: string; size: number }): string | null {
  if (!IMAGE_TYPES[file.type]) return "The photo must be a JPG, PNG, or WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "The photo must be under 4 MB. Try a smaller or more compressed copy.";
  return null;
}
