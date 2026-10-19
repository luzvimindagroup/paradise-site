import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "About",
  description:
    "Paradise Sessions is Filipino-American live music and comedy in San Diego's South Bay, built by someone from Paradise Hills.",
};

// DRAFT COPY: Alan approves before launch. Every claim here comes from the build brief; add nothing unsourced.
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <h1 className="font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.95] font-extrabold uppercase">
        About
      </h1>
      <div className="mt-6 grid gap-5 text-lg text-ink-soft">
        <p>
          Paradise is a home for Filipino-American live talent in San Diego&apos;s South Bay: music, comedy, and dance, every
          genre and every generation, in rooms small enough that you can see everyone&apos;s face.
        </p>
        <p>
          We&apos;re from here. From National City and Paradise Hills to Bonita, Chula Vista, Imperial Beach, Otay Mesa, and
          San Ysidro, this is a part of San Diego with deep Filipino roots and a lot of talent that deserves a stage close to home.
        </p>
        <p>
          <strong className="text-ink">Paradise Sessions</strong> is our music series.{" "}
          <strong className="text-ink">The Paradise Show</strong> is the variety side: music, comedy, and dance on one bill.
        </p>
      </div>

      <h2 className="mt-12 font-display text-3xl leading-none font-extrabold uppercase">Who&apos;s behind it</h2>
      <div className="mt-4 grid gap-5 text-lg text-ink-soft">
        <p>
          Alan Villegas grew up in Paradise Hills and went to school there through 8th grade. He promoted concerts in
          Honolulu from 2006 to 2008. Paradise is his project for the neighborhood he came from.
        </p>
      </div>

      <h2 className="mt-12 font-display text-3xl leading-none font-extrabold uppercase">How we work</h2>
      <ul className="mt-4 grid gap-3 text-lg text-ink-soft">
        <li><strong className="text-ink">With artists:</strong> we talk plainly about the details before anything is announced.</li>
        <li><strong className="text-ink">With rooms:</strong> well-run nights that respect your space and your neighbors.</li>
        <li><strong className="text-ink">With community groups:</strong> we want to hear your ideas and make shows easy to share.</li>
      </ul>
      <p className="mt-6 text-lg text-ink-soft">
        Want to be part of it? <Link href="/contact" className="font-bold text-ink underline">Get in touch</Link>.
      </p>

      <div className="mt-12 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <p className="mb-4 font-display text-2xl leading-tight font-bold">Hear about the first show.</p>
        <SignupForm source="about" />
      </div>
    </main>
  );
}
