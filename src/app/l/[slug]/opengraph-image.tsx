import { ImageResponse } from "next/og";
import { getPublicLanding } from "@/lib/landing";

export const alt = "Paradise Sessions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share picture for a landing page link: its headline on black with the gold bar.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublicLanding(slug);
  const title = page?.headline ?? "Paradise Sessions";
  const sub = page?.subheadline ?? "San Diego's South Bay";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000000", padding: 72, borderBottom: "24px solid #fcd116", color: "#ffffff" }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#fcd116", textTransform: "uppercase" }}>Paradise Sessions</div>
        <div style={{ display: "flex", fontSize: title.length > 30 ? 96 : title.length > 18 ? 124 : 160, lineHeight: 0.92, fontWeight: 800, textTransform: "uppercase", letterSpacing: -2 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{sub.slice(0, 80)}</div>
      </div>
    ),
    size,
  );
}
