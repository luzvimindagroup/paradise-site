import Image from "next/image";
import Link from "next/link";
import type { PublicEvent } from "@/lib/generic/events/types";

export function EventCard({ event }: { event: PublicEvent }) {
  return (
    <li className="overflow-hidden rounded-sm border-[3px] border-ink bg-surface">
      <Link href={`/events/${event.slug}`} className="block">
        {event.imageUrl && (
          <div className="relative aspect-[16/9]">
            <Image src={event.imageUrl} alt={event.imageAlt} fill sizes="(min-width: 768px) 42rem, 100vw" className="object-cover" />
          </div>
        )}
        <div className="p-5">
          <h2 className="font-display text-3xl leading-none font-extrabold uppercase">{event.title}</h2>
          <p className="mt-2 text-ink-soft">
            {[event.dateLabel ?? "Date announced to the list first", event.venue].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>
    </li>
  );
}
