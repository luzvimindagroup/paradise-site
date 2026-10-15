/** A row of the `events` table, exactly as stored (admin only: includes hidden fields). */
export type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  starts_at: string | null;
  date_public: boolean;
  venue_name: string | null;
  venue_public: boolean;
  ticket_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  created_at: string;
  updated_at: string;
};

/** What a visitor may see. Hidden date/venue are already removed. */
export type PublicEvent = {
  slug: string;
  title: string;
  description: string;
  startsAt: string | null;
  dateLabel: string | null;
  venue: string | null;
  ticketUrl: string | null;
  imageUrl: string | null;
  imageAlt: string;
};
