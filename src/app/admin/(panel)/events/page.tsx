import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/generic/admin/guard";
import type { EventRow } from "@/lib/generic/events/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const metadata: Metadata = { title: "Events" };

const chip = "rounded-sm border-2 border-ink px-2 py-0.5 text-xs font-bold";

export default async function AdminEventsPage() {
  await requireAdmin();
  const { data, error } = await createAdminClient().from("events").select("*").order("created_at", { ascending: false });
  const events = (data ?? []) as EventRow[];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase">Events</h1>
        <Link href="/admin/events/new" className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink bg-primary px-4 text-sm font-bold text-on-primary">
          New event
        </Link>
      </div>
      {error && <p className="mt-4 text-chili">Couldn&apos;t load events.</p>}
      {!error && events.length === 0 && <p className="mt-6 text-ink-soft">No events yet. Create the first one.</p>}
      <ul className="mt-6 grid gap-4">
        {events.map((e) => (
          <li key={e.id} className="rounded-sm border-[3px] border-ink bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{e.title}</p>
                <p className="mt-1 text-sm text-ink-soft">/events/{e.slug}</p>
              </div>
              <Link href={`/admin/events/${e.id}`} className="inline-flex min-h-11 items-center text-sm font-bold underline">Edit</Link>
            </div>
            <p className="mt-3 flex flex-wrap gap-2">
              <span className={`${chip} ${e.published ? "bg-primary text-on-primary" : ""}`}>{e.published ? "Published" : "Draft"}</span>
              <span className={chip}>Date {e.date_public ? "public" : "hidden"}</span>
              <span className={chip}>Venue {e.venue_public ? "public" : "hidden"}</span>
              {e.image_path && <span className={chip}>Photo</span>}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
