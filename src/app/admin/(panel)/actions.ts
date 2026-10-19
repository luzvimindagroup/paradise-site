"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { klaviyoConfigured } from "@/lib/generic/klaviyo";
import { createAdminClient } from "@/lib/generic/supabase/admin";
import { createClient } from "@/lib/generic/supabase/server";
import { KLAVIYO_COLUMNS, syncSubscriber, type SubscriberForKlaviyo } from "@/lib/klaviyo-sync";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type RetryState = { status: "idle" } | { status: "done"; synced: number; failed: number } | { status: "error"; message: string };

/** Re-send subscribers whose Klaviyo sync failed (20 at a time; stops early if Klaviyo keeps failing). Safe to run again: Klaviyo updates in place. */
export async function retryKlaviyo(): Promise<RetryState> {
  await requireAdmin();
  if (!klaviyoConfigured()) return { status: "error", message: "Klaviyo isn't connected." };

  const db = createAdminClient();
  const { data, error } = await db.from("subscribers").select(KLAVIYO_COLUMNS).eq("klaviyo_status", "failed").limit(20);
  if (error) return { status: "error", message: "Couldn't read the list." };

  let synced = 0, failed = 0, streak = 0;
  for (const row of (data ?? []) as unknown as (SubscriberForKlaviyo & { id: string })[]) {
    try {
      await syncSubscriber(row);
      const { error: bookkeeping } = await db
        .from("subscribers").update({ klaviyo_status: "synced", klaviyo_synced_at: new Date().toISOString() }).eq("id", row.id);
      if (bookkeeping) throw bookkeeping; // Klaviyo has them, but our record still says failed: count it as not done
      synced++;
      streak = 0;
    } catch {
      failed++; // still marked failed; try again later. Never log the error (it can contain the email).
      if (++streak >= 3) break; // Klaviyo is probably down; don't sit here for minutes
    }
  }
  revalidatePath("/admin"); // so the "failed" tile matches
  return { status: "done", synced, failed };
}
