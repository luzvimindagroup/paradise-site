import type { Metadata } from "next";
import { SOUTH_BAY_ZIPS } from "@/config/south-bay";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const metadata: Metadata = { title: "Admin dashboard" };

const count = (n: number | null) => (n ?? 0).toLocaleString();

export default async function DashboardPage() {
  await requireAdmin(); // the page checks too, not just the layout
  const db = createAdminClient();
  const head = { count: "exact", head: true } as const;
  const [all, southBay, failed, messages, bySource] = await Promise.all([
    db.from("subscribers").select("id", head),
    db.from("subscribers").select("id", head).in("zip", [...SOUTH_BAY_ZIPS]),
    db.from("subscribers").select("id", head).eq("klaviyo_status", "failed"),
    db.from("contact_messages").select("id", head),
    db.from("subscribers").select("source_slug"),
  ]);

  // Signups per source page (home, join, an artist page, a landing page...), biggest first.
  const sources = Object.entries(
    ((bySource.data ?? []) as { source_slug: string | null }[]).reduce<Record<string, number>>((acc, r) => {
      const k = r.source_slug || "unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const total = all.count ?? 0;
  const share = total ? Math.round(((southBay.count ?? 0) / total) * 100) : 0;
  const tiles = [
    { label: "Signups", value: count(all.count) },
    { label: "In the South Bay", value: total ? `${count(southBay.count)} (${share}%)` : "0" },
    { label: "Messages", value: count(messages.count) },
    { label: "Klaviyo sync failed", value: count(failed.count), warn: (failed.count ?? 0) > 0 },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase">Dashboard</h1>
        <a href="/admin/export" download className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink px-4 text-sm font-bold">
          Download list (CSV)
        </a>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-sm border-[3px] border-ink bg-surface p-5">
            <dt className="text-sm font-semibold text-ink-soft">{t.label}</dt>
            <dd className={`mt-1 font-display text-4xl font-extrabold ${t.warn ? "text-primary" : ""}`}>{t.value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 font-display text-xl font-extrabold uppercase">Signups by source</h2>
      {sources.length === 0 ? (
        <p className="mt-2 text-ink-soft">No signups yet.</p>
      ) : (
        <table className="mt-3 w-full max-w-md text-left text-sm">
          <thead><tr className="text-ink-soft"><th className="py-1 font-semibold">Source</th><th className="py-1 text-right font-semibold">Signups</th></tr></thead>
          <tbody>
            {sources.map(([src, n]) => (
              <tr key={src} className="border-t border-ink/20"><td className="py-2">{src}</td><td className="py-2 text-right font-bold">{n.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
