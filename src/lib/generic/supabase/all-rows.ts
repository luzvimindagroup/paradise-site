import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase hands back at most 1,000 rows per request. This keeps asking for the next page
 * until the table is exhausted, so exports and counts never stop short without warning.
 */
export async function allRows<T>(
  db: SupabaseClient,
  table: string,
  columns: string,
  orderBy = "created_at",
  pageSize = 1000,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db.from(table).select(columns).order(orderBy, { ascending: true }).range(from, from + pageSize - 1);
    if (error) throw error;
    out.push(...(data as unknown as T[]));
    if (!data || data.length < pageSize) return out;
  }
}
