import "server-only";
import type { Choice } from "@/app/admin/(panel)/landing-pages/LandingForm";
import { createAdminClient } from "@/lib/generic/supabase/admin";

/** The artists and events an admin can link a landing page to (drafts included; publishing checks they're public). */
export async function getLinkChoices(): Promise<{ artists: Choice[]; events: Choice[] }> {
  const db = createAdminClient();
  const [a, e] = await Promise.all([
    db.from("artists").select("id, name, published").order("name"),
    db.from("events").select("id, title, published").order("created_at", { ascending: false }),
  ]);
  return {
    artists: ((a.data ?? []) as { id: string; name: string; published: boolean }[]).map((x) => ({ id: x.id, label: x.published ? x.name : `${x.name} (draft)` })),
    events: ((e.data ?? []) as { id: string; title: string; published: boolean }[]).map((x) => ({ id: x.id, label: x.published ? x.title : `${x.title} (draft)` })),
  };
}
