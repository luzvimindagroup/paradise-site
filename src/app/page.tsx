import { SITE } from "@/config/site";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-between px-6 py-10 sm:px-10 sm:py-14">
      <p className="font-display text-xl font-semibold tracking-tight">
        {SITE.house}
      </p>

      <section className="py-16">
        <h1 className="font-display leading-[0.92] font-extrabold tracking-tighter text-lagoon text-[clamp(3rem,15vw,7rem)]">
          Paradise
          <br />
          Sessions
        </h1>
        <p className="mt-8 max-w-[34ch] font-display text-2xl leading-tight font-medium sm:text-3xl">
          Filipino-American talent, every genre, every generation.
        </p>
        <p className="mt-6 max-w-[48ch] text-ink-soft">
          Live in {SITE.market}. The first shows are coming soon and will be
          announced to the list first.
        </p>
        <span
          aria-hidden="true"
          className="mt-10 block h-2 w-24 rounded-sm bg-sun"
        />
      </section>

      <p className="text-sm text-ink-soft">The mailing list opens here soon.</p>
    </main>
  );
}
