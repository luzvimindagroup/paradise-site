import Link from "next/link";
import { SITE } from "@/config/site";

const NAV = [["Events", "/events"], ["Artists", "/artists"], ["About", "/about"]] as const;

/**
 * The header on every public page except landing pages (those stay navigation-free on purpose).
 * The wordmark is hidden on the home page, whose hero already carries the name.
 * On phones only the wordmark and Join show; the other links live in the footer.
 */
export function SiteHeader({ showWordmark = true, joinHref = "/join" }: { showWordmark?: boolean; joinHref?: "/join" | "#join" }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-10">
      {showWordmark ? (
        <Link href="/" className="font-wordmark text-xl italic leading-none whitespace-nowrap text-ink sm:text-3xl">
          {SITE.series}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
        {NAV.map(([label, href]) => (
          <Link key={href} href={href} className="hidden min-h-11 items-center px-3 text-sm font-bold underline-offset-4 hover:underline sm:inline-flex">
            {label}
          </Link>
        ))}
        <Link href={joinHref} className="ml-2 inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink px-4 text-sm font-bold whitespace-nowrap">
          Join the list
        </Link>
      </nav>
    </header>
  );
}
