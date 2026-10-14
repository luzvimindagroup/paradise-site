import Image from "next/image";
import type { FeaturedEvent } from "@/config/featured-event";

const cta =
  "inline-flex min-h-14 items-center rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop hover:bg-primary-deep active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

export function EventHero({ event }: { event: FeaturedEvent | null }) {
  if (event?.published && event.imageUrl) {
    // Date and venue render only when their public flags are true.
    const details = [
      event.datePublic ? event.dateLabel : null,
      event.venuePublic ? event.venueLabel : null,
    ].filter(Boolean);

    return (
      <section aria-labelledby="event-hero" className="border-y-[3px] border-ink">
        <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
          <Image
            src={event.imageUrl}
            alt={event.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end gap-4 bg-gradient-to-t from-paper via-paper/60 to-transparent p-5 sm:p-10">
            <h2 id="event-hero" className="max-w-[16ch] font-display text-[clamp(2.4rem,8vw,5rem)] leading-[0.95] font-extrabold uppercase">
              {event.title}
            </h2>
            {details.length > 0 && <p className="text-lg">{details.join(" · ")}</p>}
            <a href="#join" className={cta + " self-start"}>Join the list</a>
          </div>
        </div>
      </section>
    );
  }

  // No confirmed show yet: type-only graphic. No photo, date, or venue.
  return (
    <section aria-labelledby="event-hero" className="border-y-[3px] border-ink bg-surface">
      <div className="mx-auto flex min-h-[18rem] max-w-6xl flex-col justify-center gap-6 px-5 py-12 sm:px-10 lg:min-h-[22rem]">
        <h2
          id="event-hero"
          className="font-display text-[clamp(3rem,15vw,7.5rem)] leading-[0.82] font-extrabold uppercase"
        >
          <span className="block text-primary">First show</span>
          <span className="block text-gold">Coming soon</span>
        </h2>
        <p className="max-w-[40ch] text-lg text-ink-soft">
          Details go to the list first.
        </p>
        <a href="#join" className={cta + " self-start"}>Join the list</a>
      </div>
    </section>
  );
}
