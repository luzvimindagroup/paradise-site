import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CookieSettingsButton } from "@/components/AnalyticsRoot";
import { LandingView } from "@/components/LandingView";
import { SignupForm } from "@/components/SignupForm";
import { SITE } from "@/config/site";
import { jsonLdString, landingJsonLd } from "@/lib/generic/landing/jsonld";
import { getPublicLanding, getPublishedLandingSlugs } from "@/lib/landing";

// Pages that exist at build time are prepared ahead. Anything else is checked on request.
export async function generateStaticParams() {
  const live = await getPublishedLandingSlugs();
  return live.length ? live.map((p) => ({ slug: p.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/l/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicLanding(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/l/${page.slug}` },
    openGraph: { title: page.seoTitle, description: page.seoDescription, type: "website", url: `/l/${page.slug}` },
    // Only ever turn indexing OFF here. Never set it on: that would override the site-wide "not live yet" setting.
    ...(page.indexInSearch ? {} : { robots: { index: false, follow: false } }),
  };
}

export default async function LandingPage({ params }: PageProps<"/l/[slug]">) {
  const { slug } = await params;
  const page = await getPublicLanding(slug); // unknown address: Next streams its "not found" screen with a noindex tag (status stays 200; see guide open item 12)
  if (!page) notFound();

  const where = [page.event?.dateLabel, page.event?.venue].filter(Boolean).join(" · ");
  const jsonLd = landingJsonLd(page, `https://${SITE.domain}`, SITE.series);

  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      {page.imageUrl && (
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm border-[3px] border-ink sm:aspect-[16/10]">
          <Image src={page.imageUrl} alt={page.imageAlt} fill priority sizes="(min-width: 768px) 42rem, 100vw" className="object-cover" />
        </div>
      )}
      <h1 className="mt-6 font-display text-[clamp(2.4rem,10vw,4.75rem)] leading-[0.95] font-extrabold uppercase">{page.headline}</h1>
      {page.subheadline && <p className="mt-4 max-w-[44ch] text-xl text-ink-soft">{page.subheadline}</p>}
      {where && <p className="mt-3 text-lg font-semibold text-primary">{where}</p>}
      {page.body && <p className="mt-4 max-w-[60ch] whitespace-pre-wrap text-lg text-ink-soft">{page.body}</p>}

      <div className="mt-8 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <SignupForm source={`l-${page.slug}`} ctaLabel={page.ctaLabel} />
      </div>

      <footer className="mt-10 flex flex-wrap items-center gap-x-5 text-sm text-ink-soft">
        <span>{SITE.series} · {SITE.market}</span>
        <Link href="/privacy" className="inline-flex min-h-11 items-center underline">Privacy</Link>
        <CookieSettingsButton className="inline-flex min-h-11 items-center underline" />
      </footer>

      <LandingView slug={page.slug} />
      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(block) }} />
      ))}
    </main>
  );
}
