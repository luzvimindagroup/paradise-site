// A signup finishes on the server and then redirects, so the browser can't see it happen.
// The server leaves a short-lived note in a cookie; the next page reads it, reports it once, and clears it.
export const PENDING_COOKIE = "pending_event";

export type PendingEvent = { event: string; params: Record<string, string> };
// event_id lets a browser pixel and a later server-side report recognise the same conversion and count it once.

/** "waitlist_submit|join|<id>" -> { event: "waitlist_submit", params: { source: "join", event_id: "<id>" } } */
export function encodePending(event: string, source: string, eventId?: string): string {
  return eventId ? `${event}|${source}|${eventId}` : `${event}|${source}`;
}

const SAFE = /^[a-z0-9_-]{1,60}$/i;

export function parsePending(raw: string | undefined | null): PendingEvent | null {
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null; // a tampered cookie must never crash the page
  }
  const [event, source, eventId] = decoded.split("|");
  if (!event || !SAFE.test(event) || !source || !SAFE.test(source)) return null;
  if (eventId !== undefined && !SAFE.test(eventId)) return null;
  return { event, params: eventId ? { source, event_id: eventId } : { source } };
}
