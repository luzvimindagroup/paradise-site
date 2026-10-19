import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <h1 className="font-display text-5xl leading-none font-extrabold uppercase">Terms</h1>
      <p className="mt-4 rounded-sm border-[3px] border-ink p-4 font-semibold">
        [COUNSEL REVIEW REQUIRED] Placeholder text. Not final legal copy.
      </p>
      <div className="mt-6 grid gap-4 text-ink-soft">
        <p>This site shares news about Paradise Sessions and The Paradise Show. Use it for your own personal, non-commercial purposes.</p>
        <p>Names, logos, photos, and text on this site belong to Paradise or to the artists and photographers who made them. Please don&apos;t copy or reuse them without asking.</p>
        <p>Show information may change. Nothing here is a ticket offer or a promise that a show will happen.</p>
        <p>If you send us a message or join the list, we&apos;ll use what you share as described on our <Link href="/privacy" className="underline">privacy page</Link>.</p>
      </div>
    </main>
  );
}
