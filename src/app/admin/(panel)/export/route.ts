import { TIMEZONE } from "@/config/site";
import { getAdminUser } from "@/lib/generic/admin/guard";
import { toCsv } from "@/lib/generic/csv/csv";
import { createAdminClient } from "@/lib/generic/supabase/admin";

// Downloads the whole mailing list as a spreadsheet file. Admin only; never cached.
const COLUMNS = [
  "email", "zip", "language", "consent_at", "consent_text", "source_slug", "page_url", "referrer",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid",
  "group_size", "price_band", "name", "city", "genres", "ticket_interest", "how_heard", "instagram",
  "klaviyo_status", "created_at",
] as const;

const fmt = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, dateStyle: "short", timeStyle: "short" });
const when = (iso: string | null) => (iso ? fmt.format(new Date(iso)) : "");

export async function GET() {
  if (!(await getAdminUser())) return new Response("Sign in required", { status: 401 });

  const { data, error } = await createAdminClient()
    .from("subscribers")
    .select(COLUMNS.join(", "))
    .order("created_at", { ascending: true });
  if (error) return new Response("Could not read the list", { status: 500 });

  type Row = Record<(typeof COLUMNS)[number], string | string[] | null>;
  const rows = (data as unknown as Row[]).map((r) =>
    COLUMNS.map((c) => {
      const v = r[c];
      if (c === "consent_at" || c === "created_at") return when(v as string | null);
      return Array.isArray(v) ? v.join("; ") : v;
    }),
  );
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(toCsv([...COLUMNS], rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
