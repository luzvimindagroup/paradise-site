import Image from "next/image";
import Link from "next/link";
import type { PublicArtist } from "@/lib/generic/artists/types";

export function ArtistCard({ artist }: { artist: PublicArtist }) {
  return (
    <li className="overflow-hidden rounded-sm border-[3px] border-ink bg-surface">
      <Link href={`/artists/${artist.slug}`} className="block">
        <div className="relative aspect-[4/5]">
          <Image src={artist.imageUrl} alt={artist.imageAlt} fill sizes="(min-width: 768px) 20rem, 50vw" className="object-cover" />
        </div>
        <div className="p-4">
          <h2 className="font-display text-2xl leading-none font-extrabold uppercase">{artist.name}</h2>
          <p className="mt-2 text-sm text-ink-soft">{[artist.discipline, artist.neighborhood].filter(Boolean).join(" · ")}</p>
          {artist.tagline && <p className="mt-2 text-sm">{artist.tagline}</p>}
        </div>
      </Link>
    </li>
  );
}
