import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/generic/admin/guard";
import type { ArtistRow } from "@/lib/generic/artists/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const metadata: Metadata = { title: "Artists" };

const chip = "rounded-sm border-2 border-ink px-2 py-0.5 text-xs font-bold";

export default async function AdminArtistsPage() {
  await requireAdmin();
  const { data, error } = await createAdminClient().from("artists").select("*").order("name");
  const artists = (data ?? []) as ArtistRow[];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase">Artists</h1>
        <Link href="/admin/artists/new" className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink bg-primary px-4 text-sm font-bold text-on-primary">
          New artist
        </Link>
      </div>
      {error && <p className="mt-4 text-chili">Couldn&apos;t load artists.</p>}
      {!error && artists.length === 0 && <p className="mt-6 text-ink-soft">No artists yet. Add the first one.</p>}
      <ul className="mt-6 grid gap-4">
        {artists.map((a) => (
          <li key={a.id} className="rounded-sm border-[3px] border-ink bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{a.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{[a.discipline, a.neighborhood].filter(Boolean).join(" · ")} · /artists/{a.slug}</p>
              </div>
              <Link href={`/admin/artists/${a.id}`} className="inline-flex min-h-11 items-center text-sm font-bold underline">Edit</Link>
            </div>
            <p className="mt-3 flex flex-wrap gap-2">
              <span className={`${chip} ${a.published ? "bg-primary text-on-primary" : ""}`}>{a.published ? "Published" : "Draft"}</span>
              <span className={chip}>{a.permission_on_file ? `Permission ${a.permission_date}` : "No permission yet"}</span>
              <span className={chip}>{a.image_path ? "Photo" : "No photo"}</span>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
