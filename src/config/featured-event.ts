// The shape of the event promoted in the home-page image band.
// It comes from the events table (see src/lib/events.ts): the next published event that has a photo.
// Date and venue are already stripped unless their public flags are true.
export type FeaturedEvent = {
  title: string;
  imageUrl: string;
  imageAlt: string; // required: alt text on every image
  published: boolean;
  datePublic: boolean;
  dateLabel?: string;
  venuePublic: boolean;
  venueLabel?: string;
};
