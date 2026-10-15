import { ImageResponse } from "next/og";
import { getPublicEvent } from "@/lib/events";

export const alt = "Paradise Sessions event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share picture for an event link. Date and venue appear only if they are public (the gate already removed them otherwise).
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  const title = event?.title ?? "Paradise Sessions";
  const line = event ? [event.dateLabel, event.venue].filter(Boolean).join(" · ") || "San Diego's South Bay" : "San Diego's South Bay";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000000", padding: 72, borderBottom: "24px solid #fcd116", color: "#ffffff" }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#fcd116", textTransform: "uppercase" }}>Paradise Sessions</div>
        <div style={{ display: "flex", fontSize: title.length > 24 ? 110 : 150, lineHeight: 0.92, fontWeight: 800, textTransform: "uppercase", letterSpacing: -2 }}>{title}</div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{line}</div>
      </div>
    ),
    size,
  );
}
