// The event promoted in the home-page image band.
// Stays null until Alan confirms a signed agreement for a show. Later this
// comes from the Supabase `events` table (published + image set).
export type FeaturedEvent = {
  title: string;
  imageUrl: string;
  imageAlt: string; // required: alt text on every image
  published: boolean;
  datePublic: boolean; // defaults false; date is never shown unless true
  dateLabel?: string;
  venuePublic: boolean; // defaults false; venue is never shown unless true
  venueLabel?: string;
};

export const FEATURED_EVENT: FeaturedEvent | null = null;
