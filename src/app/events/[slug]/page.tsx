import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SignupForm } from "@/components/SignupForm";
import { getPublicEvent } from "@/lib/events";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) return { title: "Event not found" };
  const where = [event.dateLabel, event.venue].filter(Boolean).join(" · ");
  return {
    title: event.title,
    description: event.description.slice(0, 160) || where || "Paradise Sessions, San Diego's South Bay.",
  };
}

async function Detail({ params }: { params: PageProps<"/events/[slug]">["params"] }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <Link href="/events" className="inline-flex min-h-11 items-center text-sm font-bold underline">All events</Link>
      {event.imageUrl && (
        <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-sm border-[3px] border-ink">
          <Image src={event.imageUrl} alt={event.imageAlt} fill priority sizes="(min-width: 768px) 42rem, 100vw" className="object-cover" />
        </div>
      )}
      <h1 className="mt-6 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.95] font-extrabold uppercase">{event.title}</h1>
      <p className="mt-3 text-lg font-semibold text-primary">
        {[event.dateLabel ?? "Date announced to the list first", event.venue ?? "San Diego's South Bay"].join(" · ")}
      </p>
      {event.description && <p className="mt-6 max-w-[60ch] whitespace-pre-wrap text-lg text-ink-soft">{event.description}</p>}
      {event.ticketUrl && (
        <a
          href={event.ticketUrl} rel="noopener"
          className="mt-8 inline-flex min-h-14 items-center rounded-sm border-[3px] border-ink bg-primary px-6 text-lg font-bold text-on-primary shadow-pop hover:bg-primary-deep"
        >
          Get tickets
        </a>
      )}
      <div className="mt-12 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <p className="mb-4 font-display text-2xl leading-tight font-bold">Be first in the room.</p>
        <SignupForm source={`event-${event.slug}`} />
      </div>
    </main>
  );
}

export default function EventPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Detail params={params} />
    </Suspense>
  );
}
