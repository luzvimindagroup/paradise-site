"use client";

import { useEffect, useSyncExternalStore } from "react";
import { readConsent, subscribeConsent } from "@/lib/generic/analytics/consent";
import { track } from "@/lib/generic/analytics/track";

/**
 * Reports one "landing_view" event per visit to an ad/landing page (only after the visitor accepts cookies).
 * An ad platform tag added later in Google Tag Manager can listen for it. No personal data is sent.
 */
export function LandingView({ slug }: { slug: string }) {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  useEffect(() => {
    if (consent !== "granted") return;
    const key = `landing_view_${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return; // once per visit, not on every re-render
      window.sessionStorage.setItem(key, "1");
    } catch {}
    track("landing_view", { landing_slug: slug });
  }, [consent, slug]);
  return null;
}
