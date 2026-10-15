"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CONSENT_TEXT, KLAVIYO_SOURCE_LABEL, WELCOME_COOKIE } from "@/config/signup";
import { PENDING_COOKIE, encodePending } from "@/lib/generic/analytics/pending";
import { klaviyoConfigured, syncProfile, updateProperties } from "@/lib/generic/klaviyo";
import { looksLikeBot, parseSignup, parseWelcome } from "@/lib/generic/signup/validate";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export type JoinState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: "email" | "zip" | "consent" }
  | { status: "not_connected"; message: string };

export type WelcomeState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "saved" };

const supabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function joinList(_prev: JoinState, formData: FormData): Promise<JoinState> {
  // Bots get the same "thanks" page as people, but nothing is saved.
  if (looksLikeBot(formData)) redirect("/welcome");

  const parsed = parseSignup(formData);
  if (!parsed.ok) return { status: "error", ...parsed.error };
  const s = parsed.value;

  if (!supabaseConfigured()) {
    return { status: "not_connected", message: "The list isn't open yet, so we haven't saved your email. Please check back soon." };
  }

  const consentedAt = new Date().toISOString();
  const db = createAdminClient();
  const { data, error } = await db
    .from("subscribers")
    .insert({
      email: s.email,
      zip: s.zip,
      language: s.language,
      language_assumed: s.languageAssumed,
      consent_at: consentedAt,
      consent_text: CONSENT_TEXT,
      page_url: s.pageUrl,
      referrer: s.referrer,
      source_slug: s.sourceSlug,
      utm_source: s.utm.source,
      utm_medium: s.utm.medium,
      utm_campaign: s.utm.campaign,
      utm_content: s.utm.content,
    })
    .select("id")
    .single();

  // Already on the list: same thank-you page, no cookie, nothing revealed or overwritten.
  if (error?.code === "23505") redirect("/welcome");
  if (error || !data) {
    return { status: "error", message: "Something went wrong on our end. Please try again in a minute." };
  }

  let klaviyoStatus: "synced" | "failed" | "skipped" = "skipped";
  if (klaviyoConfigured()) {
    try {
      await syncProfile({
        email: s.email,
        zip: s.zip,
        source: KLAVIYO_SOURCE_LABEL,
        properties: {
          language: s.language,
          language_assumed: s.languageAssumed,
          signup_source: s.sourceSlug,
          signup_page: s.pageUrl,
          referrer: s.referrer,
          utm_source: s.utm.source,
          utm_medium: s.utm.medium,
          utm_campaign: s.utm.campaign,
          utm_content: s.utm.content,
        },
      });
      klaviyoStatus = "synced";
    } catch {
      klaviyoStatus = "failed"; // saved in our database; retried later. Never log the error (can contain the email).
    }
  }
  await db
    .from("subscribers")
    .update({ klaviyo_status: klaviyoStatus, klaviyo_synced_at: klaviyoStatus === "synced" ? new Date().toISOString() : null })
    .eq("id", data.id);

  // Note for the browser to report "waitlist_submit" once (only for brand-new signups, never repeats).
  (await cookies()).set(PENDING_COOKIE, encodePending("waitlist_submit", s.sourceSlug), {
    httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 300, path: "/",
  });
  (await cookies()).set(WELCOME_COOKIE, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });
  redirect("/welcome");
}

export async function saveWelcome(_prev: WelcomeState, formData: FormData): Promise<WelcomeState> {
  const id = (await cookies()).get(WELCOME_COOKIE)?.value;
  if (!id || !supabaseConfigured()) {
    return { status: "error", message: "This page has expired. You're still on the list." };
  }
  const parsed = parseWelcome(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };
  const w = parsed.value;

  // Only fields the person actually filled in are written.
  const patch: Record<string, unknown> = {};
  if (w.language) Object.assign(patch, { language: w.language, language_assumed: false });
  if (w.groupSize) patch.group_size = w.groupSize;
  if (w.priceBand) patch.price_band = w.priceBand;
  if (w.name) patch.name = w.name;
  if (w.city) patch.city = w.city;
  if (w.genres.length) patch.genres = w.genres;
  if (w.ticketInterest) patch.ticket_interest = w.ticketInterest;
  if (w.howHeard) patch.how_heard = w.howHeard;
  if (w.instagram) patch.instagram = w.instagram;
  if (Object.keys(patch).length === 0) return { status: "saved" };

  const { data, error } = await createAdminClient()
    .from("subscribers").update(patch).eq("id", id).select("email").single();
  if (error || !data) return { status: "error", message: "Something went wrong. Please try again." };

  if (klaviyoConfigured()) {
    try {
      await updateProperties(data.email, {
        ...(w.language && { language: w.language, language_assumed: false }),
        ...(w.groupSize && { group_size: w.groupSize }),
        ...(w.priceBand && { price_band: w.priceBand }),
        ...(w.genres.length && { genres: w.genres }),
        ...(w.ticketInterest && { ticket_interest: w.ticketInterest }),
        ...(w.howHeard && { how_heard: w.howHeard }),
        ...(w.city && { city: w.city }),
        ...(w.instagram && { instagram: w.instagram }),
      });
    } catch {
      // Best effort; our database already has the answers.
    }
  }
  return { status: "saved" };
}
