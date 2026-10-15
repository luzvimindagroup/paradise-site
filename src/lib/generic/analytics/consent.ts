// The visitor's cookie/analytics choice, remembered in this browser only.
export type Consent = "granted" | "denied" | null;

const KEY = "ps_consent";
export const CONSENT_EVENT = "ps-consent";

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {}
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** For useSyncExternalStore: re-read whenever the choice changes (this tab or another). */
export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
