import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignupForm } from "@/components/SignupForm";
import { getPublicArtist, getPublicArtists } from "@/lib/artists";

// Pages that exist at build time are prepared ahead. Anything else is checked on request.
export async function generateStaticParams() {
  const artists = await getPublicArtists();
  return artists.length ? artists.map((a) => ({ slug: a.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/artists/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getPublicArtist(slug);
  if (!artist) return { title: "Artist not found" };
  const description =
    artist.tagline ?? `${artist.name}, ${artist.discipline.toLowerCase()} from ${artist.neighborhood ?? "San Diego's South Bay"}.`;
  return {
    title: artist.name,
    description,
    alternates: { canonical: `/artists/${artist.slug}` },
    openGraph: { title: artist.name, description, type: "profile", url: `/artists/${artist.slug}` },
  };
}

export default async function ArtistPage({ params }: PageProps<"/artists/[slug]">) {
  const { slug } = await params;
  const artist = await getPublicArtist(slug); // checked BEFORE anything streams, so an unknown address is a real 404
  if (!artist) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <Link href="/artists" className="inline-flex min-h-11 items-center text-sm font-bold underline">All artists</Link>
      <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-sm border-[3px] border-ink sm:aspect-[16/10]">
        <Image src={artist.imageUrl} alt={artist.imageAlt} fill priority sizes="(min-width: 768px) 42rem, 100vw" className="object-cover" />
      </div>
      <h1 className="mt-6 font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.95] font-extrabold uppercase">{artist.name}</h1>
      <p className="mt-3 text-lg font-semibold text-primary">
        {[artist.discipline, artist.neighborhood].filter(Boolean).join(" · ")}
      </p>
      {artist.tagline && <p className="mt-4 max-w-[50ch] text-lg text-ink-soft">{artist.tagline}</p>}
      {artist.links.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-3">
          {artist.links.map((l, i) => (
            <li key={`${i}-${l.url}`}>
              <a
                href={l.url} rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink px-4 text-sm font-bold hover:bg-surface"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-12 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <p className="mb-4 font-display text-2xl leading-tight font-bold">Be first in the room.</p>
        <SignupForm source={`artist-${artist.slug}`} />
      </div>
    </main>
  );
}
