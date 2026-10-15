import { readConsent } from "./consent";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Send an event to Google Tag Manager's data layer, only if the visitor said yes.
 * Never put personal data (email, name, ZIP) in params.
 */
export function track(event: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || readConsent() !== "granted") return;
  (window.dataLayer ??= []).push({ event, ...params });
}
