import type { Metadata } from "next";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { createAdminClient } from "@/lib/generic/supabase/admin";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireAdmin(); // the page checks too, not just the layout
  const { data, error } = await createAdminClient()
    .from("contact_messages")
    .select("id, category, name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <h1 className="font-display text-[1.5rem] leading-none font-extrabold uppercase">Messages</h1>
      {error && <p className="mt-4 text-chili">Couldn&apos;t load messages.</p>}
      {data?.length === 0 && <p className="mt-4 text-ink-soft">No messages yet.</p>}
      <ul className="mt-6 grid gap-4">
        {data?.map((m) => (
          <li key={m.id} className="rounded-sm border-[3px] border-ink bg-surface p-5">
            <p className="text-sm font-semibold text-primary">{m.category}</p>
            <p className="mt-1 font-bold">
              {m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a>
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {new Date(m.created_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
