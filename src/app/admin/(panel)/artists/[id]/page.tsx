import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { artistImageBase } from "@/lib/artists";
import { requireAdmin } from "@/lib/generic/admin/guard";
import type { ArtistRow } from "@/lib/generic/artists/types";
import { createAdminClient } from "@/lib/generic/supabase/admin";
import { ArtistForm } from "../ArtistForm";

export const metadata: Metadata = { title: "Edit artist" };

export default async function EditArtistPage({ params }: PageProps<"/admin/artists/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await createAdminClient().from("artists").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const a = data as ArtistRow;

  return (
    <>
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase mb-6">Edit artist</h1>
      <ArtistForm
        values={{
          id: a.id, name: a.name, slug: a.slug, discipline: a.discipline, neighborhood: a.neighborhood ?? "",
          tagline: a.tagline ?? "", published: a.published, permissionOnFile: a.permission_on_file,
          permissionDate: a.permission_date ?? "", imageUrl: a.image_path ? `${artistImageBase()}/${a.image_path}` : null,
          imageAlt: a.image_alt ?? "", links: a.links ?? [],
        }}
      />
    </>
  );
}
