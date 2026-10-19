import type { Metadata } from "next";
import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { SignupForm } from "@/components/SignupForm";
import { getPublicArtists } from "@/lib/artists";

export const metadata: Metadata = {
  title: "Artists",
  description: "Filipino-American musicians, comedians, and dancers from San Diego's South Bay.",
};

export default async function ArtistsPage() {
  const artists = await getPublicArtists();
  return (
    <main className="mx-auto max-w-4xl px-5 py-6 sm:px-10 sm:py-12">
      <h1 className="font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.95] font-extrabold uppercase">Artists</h1>

      {artists.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {artists.map((a) => <ArtistCard key={a.slug} artist={a} />)}
        </ul>
      ) : (
        <p className="mt-4 max-w-[44ch] text-lg text-ink-soft">
          Our artists are announced to the list first. Are you a Filipino-American musician, comedian, or dancer?{" "}
          <Link href="/contact" className="font-bold text-ink underline">Get in touch</Link>.
        </p>
      )}

      <div className="mt-12 max-w-2xl rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <p className="mb-4 font-display text-2xl leading-tight font-bold">Hear who&apos;s on stage first.</p>
        <SignupForm source="artists" />
      </div>
    </main>
  );
}
