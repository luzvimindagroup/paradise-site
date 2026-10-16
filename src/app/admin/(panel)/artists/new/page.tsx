import type { Metadata } from "next";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { ArtistForm, EMPTY_ARTIST } from "../ArtistForm";

export const metadata: Metadata = { title: "New artist" };

export default async function NewArtistPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase mb-6">New artist</h1>
      <ArtistForm values={EMPTY_ARTIST} />
    </>
  );
}
