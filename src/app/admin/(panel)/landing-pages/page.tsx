import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/generic/admin/guard";
import type { LandingRow } from "@/lib/generic/landing/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const metadata: Metadata = { title: "Landing pages" };

const chip = "rounded-sm border-2 border-ink px-2 py-0.5 text-xs font-bold";

export default async function AdminLandingPage() {
  await requireAdmin();
  const { data, error } = await createAdminClient().from("landing_pages").select("*").order("created_at", { ascending: false });
  const pages = (data ?? []) as LandingRow[];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase">Landing pages</h1>
        <Link href="/admin/landing-pages/new" className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink bg-primary px-4 text-sm font-bold text-on-primary">
          New page
        </Link>
      </div>
      {error && <p className="mt-4 text-chili">Couldn&apos;t load landing pages.</p>}
      {!error && pages.length === 0 && <p className="mt-6 text-ink-soft">No landing pages yet. Create the first one.</p>}
      <ul className="mt-6 grid gap-4">
        {pages.map((p) => (
          <li key={p.id} className="rounded-sm border-[3px] border-ink bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{p.headline}</p>
                <p className="mt-1 text-sm text-ink-soft">/l/{p.slug}</p>
              </div>
              <Link href={`/admin/landing-pages/${p.id}`} className="inline-flex min-h-11 items-center text-sm font-bold underline">Edit</Link>
            </div>
            <p className="mt-3 flex flex-wrap gap-2">
              <span className={`${chip} ${p.published ? "bg-primary text-on-primary" : ""}`}>{p.published ? "Published" : "Draft"}</span>
              {p.artist_id && <span className={chip}>Artist linked</span>}
              {p.event_id && <span className={chip}>Event linked</span>}
              {!p.index_in_search && <span className={chip}>Hidden from search</span>}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
