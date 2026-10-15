import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Artists, comedians, rooms, community groups, and press: get in touch with Paradise Sessions.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold underline">Back</Link>
      <h1 className="mt-6 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.95] font-extrabold uppercase">
        Contact
      </h1>
      <p className="mt-4 max-w-[44ch] text-lg text-ink-soft">
        Artists, comedians, rooms, community groups, and press: tell us who you are and what you have in mind.
      </p>
      <div className="mt-8 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <ContactForm />
      </div>
    </main>
  );
}
