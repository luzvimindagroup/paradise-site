import { TIMEZONE } from "@/config/site";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { toCsv } from "@/lib/generic/csv/csv";
import { formatZonedFull, todayIn } from "@/lib/generic/events/zoned";
import { allRows } from "@/lib/generic/supabase/all-rows";
import { createAdminClient } from "@/lib/generic/supabase/admin";

// Downloads the whole mailing list as a spreadsheet file. Admin only; never cached.
const COLUMNS = [
  "email", "zip", "language", "consent_at", "consent_text", "source_slug", "page_url", "referrer",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid",
  "group_size", "price_band", "name", "city", "genres", "ticket_interest", "how_heard", "instagram",
  "klaviyo_status", "created_at",
] as const;
type Row = Record<(typeof COLUMNS)[number], string | string[] | null>;

export async function GET() {
  await requireAdmin(); // anyone else is sent to the login page, like every admin screen

  let data: Row[];
  try {
    data = await allRows<Row>(createAdminClient(), "subscribers", COLUMNS.join(", "));
  } catch {
    return new Response("Could not read the list", { status: 500 });
  }

  const rows = data.map((r) =>
    COLUMNS.map((c) => {
      const v = r[c];
      if (c === "consent_at" || c === "created_at") return v ? formatZonedFull(v as string, TIMEZONE) : "";
      return Array.isArray(v) ? v.join("; ") : v;
    }),
  );
  return new Response(toCsv([...COLUMNS], rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${todayIn(TIMEZONE)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
