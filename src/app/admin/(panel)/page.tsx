import type { Metadata } from "next";
import { SOUTH_BAY_ZIPS } from "@/config/south-bay";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const metadata: Metadata = { title: "Admin dashboard" };

const count = (n: number | null) => (n ?? 0).toLocaleString();

export default async function DashboardPage() {
  const db = createAdminClient();
  const head = { count: "exact", head: true } as const;
  const [all, southBay, failed, messages] = await Promise.all([
    db.from("subscribers").select("id", head),
    db.from("subscribers").select("id", head).in("zip", [...SOUTH_BAY_ZIPS]),
    db.from("subscribers").select("id", head).eq("klaviyo_status", "failed"),
    db.from("contact_messages").select("id", head),
  ]);

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
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase">Dashboard</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-sm border-[3px] border-ink bg-surface p-5">
            <dt className="text-sm font-semibold text-ink-soft">{t.label}</dt>
            <dd className={`mt-1 font-display text-4xl font-extrabold ${t.warn ? "text-primary" : ""}`}>{t.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
