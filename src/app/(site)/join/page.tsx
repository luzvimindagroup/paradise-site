import type { Metadata } from "next";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Join the list",
  description: "Hear about Paradise Sessions shows in San Diego's South Bay before anyone else.",
};

export default function JoinPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-10 sm:py-12">
      <h1 className="font-display text-[clamp(2.4rem,9vw,4.5rem)] leading-[0.95] font-extrabold uppercase">
        Join the list
      </h1>
      <p className="mt-4 max-w-[44ch] text-lg text-ink-soft">
        Filipino-American talent, every genre, every generation. Show details reach the list first.
      </p>
      <div className="mt-8 rounded-sm border-[3px] border-ink bg-surface p-5 shadow-card sm:p-7">
        <SignupForm source="join" showLanguage />
      </div>
    </main>
  );
}
