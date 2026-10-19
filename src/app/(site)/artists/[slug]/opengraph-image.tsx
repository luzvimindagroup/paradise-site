import { ImageResponse } from "next/og";
import { getPublicArtist } from "@/lib/artists";

export const alt = "Paradise Sessions artist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share picture for an artist link. Only cleared, published artists get their name here.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getPublicArtist(slug);
  const name = artist?.name ?? "Paradise Sessions";
  const line = artist ? [artist.discipline, artist.neighborhood].filter(Boolean).join(" · ") : "San Diego's South Bay";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000000", padding: 72, borderBottom: "24px solid #fcd116", color: "#ffffff" }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#fcd116", textTransform: "uppercase" }}>Paradise Sessions</div>
        <div style={{ display: "flex", fontSize: name.length > 20 ? 120 : 160, lineHeight: 0.92, fontWeight: 800, textTransform: "uppercase", letterSpacing: -2 }}>{name}</div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{line}</div>
      </div>
    ),
    size,
  );
}
