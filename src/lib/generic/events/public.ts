import { formatZoned } from "./zoned";
import type { EventRow, PublicEvent } from "./types";

/**
 * THE gate. Every public page gets events through this function, so a hidden date or venue
 * can't leak by a page forgetting to check a flag. Unpublished events return null.
 */
export function toPublicEvent(
  row: EventRow,
  opts: { tz: string; imageBaseUrl: string },
): PublicEvent | null {
  if (!row.published) return null;
  const showDate = row.date_public && row.starts_at !== null;
  const showVenue = row.venue_public && Boolean(row.venue_name);
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    startsAt: showDate ? row.starts_at : null,
    dateLabel: showDate ? formatZoned(row.starts_at!, opts.tz) : null,
    venue: showVenue ? row.venue_name : null,
    ticketUrl: row.ticket_url || null,
    imageUrl: row.image_path ? `${opts.imageBaseUrl}/${row.image_path}` : null,
    imageAlt: row.image_alt || row.title,
  };
}

/** Upcoming = no public date yet, or a date in the future. Past = a public date that has passed. */
export function splitEvents(events: PublicEvent[], now: Date): { upcoming: PublicEvent[]; past: PublicEvent[] } {
  const t = (e: PublicEvent) => Date.parse(e.startsAt!);
  const isPast = (e: PublicEvent) => e.startsAt !== null && t(e) < now.getTime();
  const upcoming = events.filter((e) => !isPast(e)).sort((a, b) => {
    if (a.startsAt && b.startsAt) return t(a) - t(b); // soonest first
    if (a.startsAt) return -1; // dated before undated
    if (b.startsAt) return 1;
    return 0;
  });
  const past = events.filter(isPast).sort((a, b) => t(b) - t(a)); // most recent first
  return { upcoming, past };
}
