import "server-only";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/generic/supabase/admin";
import { createClient } from "@/lib/generic/supabase/server";

/** Is this email on the admins list? (Server only; uses the service role.) */
export async function isAllowedAdmin(email: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("admins")
    .select("id")
    .eq("email_lower", email.trim().toLowerCase())
    .maybeSingle();
  return Boolean(data);
}

/** The signed-in user, but only if they are an admin. Asks Supabase to verify the session each time. */
export async function getAdminUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email || !(await isAllowedAdmin(email))) return null;
  return { id: data.user!.id, email };
}

/** Use at the top of every admin page or action. Sends everyone else to the login page. */
export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}
