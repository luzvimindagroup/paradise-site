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
export async function allowAttempt(rule: LimitRule, opts: { subject?: string | null; withIp?: boolean } = {}): Promise<boolean> {
  const salt = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!salt || !process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
  const h = await headers();
  const ip = clientIp((n) => h.get(n));
  // Key on the subject (an email), the connection, or both.
  const parts = opts.subject ? (opts.withIp ? [ip, opts.subject] : [opts.subject]) : [ip];
  if (parts.some((x) => !x)) return true; // nothing to key on (local dev without a proxy)

  let data: boolean | null = null, error: unknown = null;
  try {
    ({ data, error } = await createAdminClient().rpc("rate_limit_hit", {
      p_key: limitKey(rule.purpose, parts.join("|"), salt),
      p_window_seconds: rule.windowSeconds,
      p_max: rule.max,
    }));
  } catch (e) {
    error = e;
  }
  if (error) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.error("Rate limiting is off: the rate_limit_hit function is missing or failing.");
    }
    return true;
  }
  return data !== false;
}
