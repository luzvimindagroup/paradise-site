import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client with the service role key. It bypasses Row Level Security,
// so it must never be imported from a Client Component.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
