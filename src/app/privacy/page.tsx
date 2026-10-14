import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold underline">Back</Link>
      <h1 className="mt-6 font-display text-5xl leading-none font-extrabold uppercase">Privacy</h1>
      <p className="mt-4 rounded-sm border-[3px] border-ink p-4 font-semibold">
        [COUNSEL REVIEW REQUIRED] Placeholder text. Not final legal copy.
      </p>
      <div className="mt-6 grid gap-4 text-ink-soft">
        <p>When you join the list we collect your email, ZIP code, and language preference, plus any optional answers you add. We use them to email you about Paradise shows and news.</p>
        <p>We also note which page you joined from, so we know which links are working.</p>
        <p>You can unsubscribe from any email at any time. We don&apos;t collect phone numbers.</p>
      </div>
    </main>
  );
}
