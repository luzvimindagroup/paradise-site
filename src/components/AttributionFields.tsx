"use client";

import { useSyncExternalStore } from "react";

// Remembers where a visitor first arrived (UTMs, referrer, landing page) so it
// travels with the signup even if they browse around first.
const KEY = "ps_attr";
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
let cached: string | null = null;

function snapshot(): string {
  if (cached) return cached;
  const q = new URLSearchParams(window.location.search);
  const fresh: Record<string, string> = {
    landing_page: window.location.pathname + window.location.search,
    referrer: document.referrer,
  };
  UTMS.forEach((k) => { const v = q.get(k); if (v) fresh[k] = v.slice(0, 200); });
  const hasUtm = UTMS.some((k) => fresh[k]);

  // A link with UTM tags (a new ad click) replaces what we remembered.
  // Otherwise keep the first-touch info from the visitor's earlier page.
  let first = fresh;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved && !hasUtm) first = JSON.parse(saved);
    else window.localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {}
  return (cached = JSON.stringify({ ...first, started_at: String(Date.now()) }));
}

const subscribe = () => () => {};

export function AttributionFields() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}");
  const a = JSON.parse(raw) as Record<string, string>;
  return (
    <>
      {["landing_page", "referrer", ...UTMS].map((k) => (
        <input key={k} type="hidden" name={k} value={a[k] ?? ""} />
      ))}
      <input type="hidden" name="started_at" value={a.started_at ?? ""} />
    </>
  );
}
