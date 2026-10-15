"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { readConsent, subscribeConsent, writeConsent, type Consent } from "@/lib/generic/analytics/consent";
import { PENDING_COOKIE, parsePending } from "@/lib/generic/analytics/pending";
import { track } from "@/lib/generic/analytics/track";

// Set NEXT_PUBLIC_GTM_ID (looks like GTM-XXXXXXX) to switch analytics on. Unset = no banner, nothing loads.
const GTM_ID = /^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM_ID ?? "") ? process.env.NEXT_PUBLIC_GTM_ID! : null;

const useConsent = (): Consent | "unknown" =>
  useSyncExternalStore(subscribeConsent, readConsent, () => "unknown");

/** Reports an event the server left behind (e.g. a finished signup), once, after the visitor has chosen. */
function useFlushPending(consent: Consent | "unknown") {
  const pathname = usePathname(); // this component lives in the layout, so re-check after every page change
  useEffect(() => {
    if (consent === "unknown" || consent === null) return; // wait until they choose; the note lasts 5 minutes
    const match = document.cookie.split("; ").find((c) => c.startsWith(`${PENDING_COOKIE}=`));
    if (!match) return;
    document.cookie = `${PENDING_COOKIE}=; Max-Age=0; Path=/`;
    const pending = parsePending(match.slice(PENDING_COOKIE.length + 1));
    if (pending && consent === "granted") track(pending.event, pending.params);
  }, [consent, pathname]);
}

export function AnalyticsRoot() {
  const consent = useConsent();
  useFlushPending(consent);
  if (!GTM_ID) return null;

  return (
    <>
      {consent === "granted" && (
        <Script id="gtm" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=document.getElementsByTagName('script')[0],j=document.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';f.parentNode.insertBefore(j,f);`}
        </Script>
      )}
      {consent === null && (
        <section
          aria-label="Cookies"
          className="fixed inset-x-0 bottom-0 z-50 border-t-[3px] border-ink bg-surface p-4 sm:p-5"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              We use cookies for anonymous traffic stats, so we can see which links work.{" "}
              <Link href="/privacy" className="underline">Privacy</Link>
            </p>
            <div className="flex gap-3">
              <button
                type="button" onClick={() => writeConsent("denied")}
                className="min-h-11 flex-1 rounded-sm border-[3px] border-ink px-5 text-sm font-bold sm:flex-none"
              >
                Decline
              </button>
              <button
                type="button" onClick={() => writeConsent("granted")}
                className="min-h-11 flex-1 rounded-sm border-[3px] border-ink bg-primary px-5 text-sm font-bold text-on-primary sm:flex-none"
              >
                Accept
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
