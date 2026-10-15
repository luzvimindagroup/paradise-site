"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/generic/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
