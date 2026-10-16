import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/generic/admin/guard";
import type { LandingRow } from "@/lib/generic/landing/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";
import { landingImageBase } from "@/lib/landing";
import { getLinkChoices } from "@/lib/landing-admin";
import { LandingForm } from "../LandingForm";

export const metadata: Metadata = { title: "Edit landing page" };

export default async function EditLandingPage({ params }: PageProps<"/admin/landing-pages/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await createAdminClient().from("landing_pages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as LandingRow;
  const { artists, events } = await getLinkChoices();

  return (
    <>
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase mb-6">Edit landing page</h1>
      <LandingForm
        artists={artists} events={events}
        values={{
          id: p.id, headline: p.headline, slug: p.slug, subheadline: p.subheadline ?? "", body: p.body ?? "",
          ctaLabel: p.cta_label, artistId: p.artist_id ?? "", eventId: p.event_id ?? "",
          imageUrl: p.image_path ? `${landingImageBase()}/${p.image_path}` : null, imageAlt: p.image_alt ?? "",
          seoTitle: p.seo_title ?? "", seoDescription: p.seo_description ?? "",
          hideFromSearch: !p.index_in_search, published: p.published,
        }}
      />
    </>
  );
}
