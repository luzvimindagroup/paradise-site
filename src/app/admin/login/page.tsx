import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in" };

async function Notice({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 font-semibold text-chili">
      That sign-in link didn&apos;t work or has expired. Request a new one below, and open it in the same browser.
    </p>
  );
}

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
      <h1 className="font-display text-5xl leading-none font-extrabold uppercase">Admin</h1>
      <Suspense fallback={null}>
        <Notice searchParams={searchParams as Promise<{ error?: string }>} />
      </Suspense>
      <div className="mt-6 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <LoginForm />
      </div>
    </main>
  );
}
