import type { Metadata } from "next";
import { Big_Shoulders } from "next/font/google";
import "./directions.css";

const shoulders = Big_Shoulders({
  variable: "--font-shoulders",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = { title: "Brand directions (temporary)" };

type Swatch = { name: string; hex: string; note: string; fg: string };

const A: Swatch[] = [
  { name: "Paper", hex: "#f2eee9", note: "base · ink 15.1:1", fg: "#1c1917" },
  { name: "Ink", hex: "#1c1917", note: "text", fg: "#ffffff" },
  { name: "Lagoon", hex: "#0b6461", note: "PRIMARY · white on it 7.0:1", fg: "#ffffff" },
  { name: "Hibiscus", hex: "#b8225a", note: "support · 5.3:1 on paper", fg: "#ffffff" },
  { name: "Sun", hex: "#e9b52f", note: "support · fills only", fg: "#1c1917" },
];
const B: Swatch[] = [
  { name: "Lilac paper", hex: "#f4eff2", note: "base · ink 15.7:1", fg: "#1b1522" },
  { name: "Night plum", hex: "#1b1522", note: "text", fg: "#ffffff" },
  { name: "Ube", hex: "#4a2a82", note: "PRIMARY · white on it 10.8:1", fg: "#ffffff" },
  { name: "Calamansi", hex: "#d4e157", note: "support · fills, ink on it 12.5:1", fg: "#1b1522" },
  { name: "Chili", hex: "#c4401f", note: "support · 4.5:1 on base", fg: "#ffffff" },
];

function Direction({
  id, cls, title, blurb, swatches, typeNote, buttonNote, cardNote,
}: {
  id: string; cls: string; title: string; blurb: string; swatches: Swatch[];
  typeNote: string; buttonNote: string; cardNote: string;
}) {
  return (
    <section id={id} className={`dir ${cls}`} aria-labelledby={`${id}-t`}>
      <div>
        <h2 id={`${id}-t`} className="name">{title}</h2>
        <p className="tag">{blurb}</p>

        <div className="sec">
          <h3>Palette</h3>
          <div className="swatches">
            {swatches.map((s) => (
              <div key={s.hex} className="sw" style={{ background: s.hex, color: s.fg }}>
                <b>{s.name}</b>{s.hex}<br />{s.note}
              </div>
            ))}
          </div>
        </div>

        <div className="sec">
          <h3>Type: {typeNote}</h3>
          <p className="headline">Paradise Sessions</p>
          <p className="promise">Filipino-American talent, every genre, every generation.</p>
          <p className="body">
            Live in San Diego&apos;s South Bay. Hip-hop, R&amp;B, island, jazz, OPM, comedy and
            dance, all under one roof. The first shows are coming soon and will be announced to
            the list first.
          </p>
        </div>

        <div className="sec">
          <h3>Buttons: {buttonNote}</h3>
          <div className="btns">
            <button type="button" className="btn btn-p">Join the list</button>
            <button type="button" className="btn btn-s">See who&apos;s playing</button>
            <button type="button" className="btn btn-d" disabled>Joining…</button>
          </div>
        </div>

        <div className="sec">
          <h3>Signup (home page version)</h3>
          <div className="form">
            <div>
              <label htmlFor={`${id}-e`}>Email</label>
              <input id={`${id}-e`} type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" />
            </div>
            <div>
              <label htmlFor={`${id}-z`}>ZIP code</label>
              <input id={`${id}-z`} type="text" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="91950" />
            </div>
            <button type="button" className="btn btn-p">Get first access</button>
          </div>
        </div>

        <div className="sec">
          <h3>Card: {cardNote}</h3>
          <div className="card">
            <h4>An intimate room, San Diego&apos;s South Bay</h4>
            <p>Details announced to the list first. <span className="accent"><b>Coming soon</b></span></p>
          </div>
        </div>

        <div className="sec">
          <h3>&ldquo;Announced to the list first&rdquo; band</h3>
          <div className="band">
            <p>The first show goes to the list first.</p>
            <p>Join now and you hear before anyone else.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DirectionsPage() {
  return (
    <div className={shoulders.variable}>
      <nav className="pickbar" aria-label="Jump to direction">
        <a href="#a">A: Lagoon Warm</a>
        <a href="#b">B: Ube Marquee</a>
      </nav>
      <Direction
        id="a" cls="dir-a" title="A · Lagoon Warm"
        blurb="Calm, friendly, modern. Soft shapes, teal anchors the page, warm paper behind it. Feels like a good neighborhood cafe."
        swatches={A}
        typeNote="Bricolage Grotesque (headlines) + Figtree (text)"
        buttonNote="pill-shaped, solid teal"
        cardNote="soft white, big rounded corners"
        />
      <Direction
        id="b" cls="dir-b" title="B · Ube Marquee"
        blurb="Loud, confident, show-night energy. Tall poster type, ube purple, flat shapes with hard shadows like a printed ticket."
        swatches={B}
        typeNote="Big Shoulders (headlines) + Figtree (text)"
        buttonNote="square with a hard shadow that presses down"
        cardNote="ticket stub with dashed tear edge"
      />
    </div>
  );
}
