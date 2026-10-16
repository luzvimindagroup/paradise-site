import type { Metadata } from "next";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { getLinkChoices } from "@/lib/landing-admin";
import { EMPTY_LANDING, LandingForm } from "../LandingForm";

export const metadata: Metadata = { title: "New landing page" };

export default async function NewLandingPage() {
  await requireAdmin();
  const { artists, events } = await getLinkChoices();
  return (
    <>
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase mb-6">New landing page</h1>
      <LandingForm values={EMPTY_LANDING} artists={artists} events={events} />
    </>
  );
}
