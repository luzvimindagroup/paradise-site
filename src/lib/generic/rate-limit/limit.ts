import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/generic/supabase/admin";
import { clientIp, limitKey } from "./key";

export type LimitRule = { purpose: string; windowSeconds: number; max: number };

let warnedMissing = false;

/**
 * Count one attempt and say whether it's still allowed. Shared across all server instances
 * through the database. If the database function isn't installed yet, everything is allowed
 * and a warning is logged once, so a missing migration never blocks real people.
 */
export async function allowAttempt(rule: LimitRule, subject?: string | null): Promise<boolean> {
  const salt = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!salt) return true;
  const h = await headers();
  const who = subject ?? clientIp((n) => h.get(n));
  if (!who) return true; // nothing to key on (local dev without a proxy)

  const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
    p_key: limitKey(rule.purpose, who, salt),
    p_window_seconds: rule.windowSeconds,
    p_max: rule.max,
  });
  if (error) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.error("Rate limiting is off: the rate_limit_hit function is missing or failing.");
    }
    return true;
  }
  return data !== false;
}
