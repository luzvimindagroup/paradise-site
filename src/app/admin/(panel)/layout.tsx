import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/generic/admin/guard";
import { signOut } from "./actions";

// Everything inside this folder is admin-only. The check runs on the server for every request.
async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const nav = "inline-flex min-h-11 items-center px-3 text-sm font-bold underline-offset-4 hover:underline";
  return (
    <div className="mx-auto max-w-5xl px-5 py-4 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink pb-3">
        <nav aria-label="Admin" className="-ml-3 flex flex-wrap">
          <Link href="/admin" className={nav}>Dashboard</Link>
          <Link href="/admin/events" className={nav}>Events</Link>
          <Link href="/admin/messages" className={nav}>Messages</Link>
        </nav>
        <form action={signOut} className="flex items-center gap-3 text-sm">
          <span className="text-ink-soft">{admin.email}</span>
          <button type="submit" className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink px-4 font-bold">
            Sign out
          </button>
        </form>
      </header>
      <div className="py-8">{children}</div>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-8 text-ink-soft">Loading…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
