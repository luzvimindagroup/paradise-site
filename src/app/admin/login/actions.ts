"use server";

import { headers } from "next/headers";
import { isAllowedAdmin } from "@/lib/generic/admin/guard";
import { createClient } from "@/lib/generic/supabase/server";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "sent" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function requestLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  if (!EMAIL.test(email)) return { status: "error", message: "Enter a valid email, like you@email.com." };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { status: "error", message: "Login isn't connected to the database yet." };
  }

  // Only emails on the admins list get a link. Everyone sees the same answer,
  // so the page never reveals who is or isn't an admin.
  if (await isAllowedAdmin(email)) {
    const h = await headers();
    const origin = h.get("origin") ?? `https://${h.get("host")}`;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/admin/auth/confirm`, shouldCreateUser: true },
    });
    if (error) return { status: "error", message: "Couldn't send the link just now. Wait a minute and try again." };
  }
  return { status: "sent" };
}
