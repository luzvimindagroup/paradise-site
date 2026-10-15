import type { Metadata } from "next";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { EMPTY_EVENT, EventForm } from "../EventForm";

export const metadata: Metadata = { title: "New event" };

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase mb-6">New event</h1>
      <EventForm values={EMPTY_EVENT} />
    </>
  );
}
