import { ImageResponse } from "next/og";

export const alt = "Paradise Sessions: Filipino-American talent, every genre, every generation.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", background: "#15101c", padding: 72,
          borderBottom: "24px solid #fcd116", color: "#f4eff2",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", fontSize: 168, lineHeight: 0.9, fontWeight: 800, color: "#b79cf2", textTransform: "uppercase", letterSpacing: -2 }}>
          <span>Paradise</span>
          <span>Sessions</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, maxWidth: 800 }}>
          Filipino-American talent, every genre, every generation.
        </div>
      </div>
    ),
    size,
  );
}
