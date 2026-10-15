import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { SignupForm } from "@/components/SignupForm";
import { getPublicEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming Paradise Sessions shows in San Diego's South Bay, and the ones we've done.",
};

export default async function EventsPage() {
  const { upcoming, past } = await getPublicEvents();
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold underline">Back</Link>
      <h1 className="mt-6 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.95] font-extrabold uppercase">Events</h1>

      {upcoming.length > 0 ? (
        <ul className="mt-8 grid gap-6">{upcoming.map((e) => <EventCard key={e.slug} event={e} />)}</ul>
      ) : (
        <p className="mt-4 max-w-[44ch] text-lg text-ink-soft">
          First show coming soon. Details go to the list first.
        </p>
      )}

      {past.length > 0 && (
        <section aria-labelledby="past" className="mt-14">
          <h2 id="past" className="font-display text-3xl leading-none font-extrabold uppercase">Past shows</h2>
          <ul className="mt-6 grid gap-6">{past.map((e) => <EventCard key={e.slug} event={e} />)}</ul>
        </section>
      )}

      <div className="mt-12 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <p className="mb-4 font-display text-2xl leading-tight font-bold">Hear about the next show first.</p>
        <SignupForm source="events" />
      </div>
    </main>
  );
}
