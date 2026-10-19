"use server";

import { CONTACT_CATEGORIES } from "@/config/contact";
import { LIMITS, TOO_MANY } from "@/config/rate-limits";
import { parseContact, type ContactField } from "@/lib/generic/contact/validate";
import { allowAttempt } from "@/lib/generic/rate-limit/limit";
import { looksLikeBot } from "@/lib/generic/signup/validate";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export type ContactState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: ContactField }
  | { status: "not_connected"; message: string }
  | { status: "sent"; category?: string };

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Bots get the same "thanks" as people, but nothing is saved.
  if (looksLikeBot(formData)) return { status: "sent" };

  const parsed = parseContact(formData, CONTACT_CATEGORIES);
  if (!parsed.ok) return { status: "error", field: parsed.field, message: parsed.message };
  if (!(await allowAttempt(LIMITS.contact))) return { status: "error", message: TOO_MANY };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { status: "not_connected", message: "Messages aren't open yet, so we haven't saved yours. Please check back soon." };
  }

  const v = parsed.value;
  const { error } = await createAdminClient().from("contact_messages").insert({
    category: v.category, name: v.name, email: v.email, message: v.message, page_url: v.pageUrl,
  });
  if (error) return { status: "error", message: "Something went wrong on our end. Please try again in a minute." };
  return { status: "sent", category: v.category };
}
