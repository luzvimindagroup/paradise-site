import { CookieSettingsButton } from "@/components/AnalyticsRoot";
import { SITE, SITE_CREDIT } from "@/config/site";

const LINKS = [["Events", "/events"], ["Artists", "/artists"], ["About", "/about"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]] as const;

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink-soft sm:px-10">
      <p>{SITE.series} · {SITE.market}</p>
      <nav aria-label="Footer" className="mt-2 flex flex-wrap gap-x-5">
        {LINKS.map(([t, h]) => (
          <a key={h} href={h} className="inline-flex min-h-11 items-center underline">{t}</a>
        ))}
        <CookieSettingsButton className="inline-flex min-h-11 items-center underline" />
      </nav>
      {SITE_CREDIT && <p className="mt-4 text-xs">{SITE_CREDIT}</p>}
    </footer>
  );
}
