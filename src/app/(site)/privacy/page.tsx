import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/AnalyticsRoot";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <h1 className="font-display text-5xl leading-none font-extrabold uppercase">Privacy</h1>
      <p className="mt-4 rounded-sm border-[3px] border-ink p-4 font-semibold">
        [COUNSEL REVIEW REQUIRED] Placeholder text. Not final legal copy.
      </p>
      <div className="mt-6 grid gap-4 text-ink-soft">
        <p>When you join the list we collect your email, ZIP code, and language preference, plus any optional answers you add. We use them to email you about Paradise shows and news.</p>
        <p>We also note which page you joined from, so we know which links are working.</p>
        <p>If you send us a message through the contact form, we keep your name, email, and message so we can reply.</p>
        <p>Your browser remembers which link first brought you here (so we know which links work) and, if you answer the cookie banner, your choice. If you accept, we also use Google Tag Manager to count visits and sign-ups in aggregate. If you decline, none of that runs.</p>
        <p>If you arrive from an ad, we keep the ad&apos;s click ID (a code in the link) with your sign-up, so we can tell which ads are working.</p>
        <p>After you join the list we place a short-lived cookie (about an hour) so you can add optional answers on the next page.</p>
        <p>You can unsubscribe from any email at any time. We don&apos;t collect phone numbers.</p>
      </div>
      <CookieSettingsButton className="mt-6 inline-flex min-h-11 items-center text-sm font-bold underline" />
    </main>
  );
}
