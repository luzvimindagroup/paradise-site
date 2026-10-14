import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { WELCOME_COOKIE } from "@/config/signup";
import { WelcomeForm } from "@/components/WelcomeForm";

export const metadata: Metadata = { title: "You're on the list" };

// The cookie is set only for brand-new signups; it lets them fill in their own answers.
async function OptionalAnswers() {
  const canEdit = Boolean((await cookies()).get(WELCOME_COOKIE)?.value);
  if (!canEdit) return null;
  return (
    <div className="mt-8 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
      <WelcomeForm />
    </div>
  );
}

export default function WelcomePage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-10 sm:py-16">
      <h1 className="font-display text-[clamp(2.6rem,10vw,5rem)] leading-[0.95] font-extrabold uppercase">
        You&apos;re on the list
      </h1>
      <p className="mt-4 max-w-[48ch] text-lg text-ink-soft">
        Check your email to confirm. Show details go to the list first.
      </p>
      <Suspense fallback={null}>
        <OptionalAnswers />
      </Suspense>
      <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-sm font-bold underline">
        Back to the home page
      </Link>
    </main>
  );
}
