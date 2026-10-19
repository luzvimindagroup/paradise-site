import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TIMEZONE } from "@/config/site";
import { IMAGE_BUCKET } from "@/lib/events";
import { isUuid } from "@/lib/generic/ids";
import { requireAdmin } from "@/lib/generic/admin/guard";
import type { EventRow } from "@/lib/generic/events/types";
import { utcToZonedInput } from "@/lib/generic/events/zoned";
import { createAdminClient } from "@/lib/generic/supabase/admin";
import { EventForm } from "../EventForm";

export const metadata: Metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: PageProps<"/admin/events/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { data } = await createAdminClient().from("events").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const e = data as EventRow;

  return (
    <>
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase mb-6">Edit event</h1>
      <EventForm
        values={{
          id: e.id, title: e.title, slug: e.slug, description: e.description, published: e.published,
          startsAtLocal: e.starts_at ? utcToZonedInput(e.starts_at, TIMEZONE) : "",
          datePublic: e.date_public, venueName: e.venue_name ?? "", venuePublic: e.venue_public,
          ticketUrl: e.ticket_url ?? "",
          imageUrl: e.image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${e.image_path}` : null,
          imageAlt: e.image_alt ?? "",
        }}
      />
    </>
  );
}
