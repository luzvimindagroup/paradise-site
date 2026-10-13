import Link from "next/link";
import { SignupForm } from "@/components/SignupForm";
import { SITE } from "@/config/site";

const blocks = [
  {
    title: "Live, close to home",
    body: `Intimate shows across ${SITE.market}, from National City to San Ysidro.`,
  },
  {
    title: "Every genre, every generation",
    body: "Hip-hop, R&B, island, jazz, OPM, comedy, dance. Rising artists and seasoned ones on the same night.",
  },
  {
    title: "The list hears first",
    body: "Show details, tickets, and artist news reach the list before anyone else.",
  },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-10">
        <Link href="/" className="font-display text-3xl font-extrabold tracking-wide uppercase">
          {SITE.house}
        </Link>
        <a
          href="#join"
          className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-ink px-4 text-sm font-bold"
        >
          Join the list
        </a>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-5 px-5 pt-0 pb-12 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:pt-12 lg:pb-20">
          <div>
            <h1 className="font-display text-[clamp(4rem,21vw,10rem)] leading-[0.86] font-extrabold tracking-normal text-primary uppercase">
              Paradise
              <br />
              Sessions
            </h1>
            <p className="mt-4 max-w-[28ch] font-display text-[1.75rem] leading-[1.05] font-bold sm:mt-5 sm:text-4xl">
              Filipino-American talent, every genre, every generation.
            </p>
          </div>
          <div
            id="join"
            className="scroll-mt-4 rounded-sm border-[3px] border-ink bg-white p-5 shadow-card sm:p-7"
          >
            <p className="mb-3 font-display text-xl leading-tight font-bold sm:mb-4 sm:text-2xl">
              Hear about the first show.
            </p>
            <SignupForm />
          </div>
        </section>

        <section aria-labelledby="what" className="mx-auto max-w-6xl px-5 pb-14 sm:px-10 lg:pb-20">
          <h2 id="what" className="sr-only">What Paradise Sessions is</h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {blocks.map((b) => (
              <li
                key={b.title}
                className="rounded-sm border-[3px] border-ink bg-white p-6 shadow-card"
              >
                <h3 className="font-display text-3xl leading-none font-bold">{b.title}</h3>
                <p className="mt-3 text-ink-soft">{b.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="first" className="border-y-[3px] border-ink bg-lime">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-14">
            <h2
              id="first"
              className="max-w-[18ch] font-display text-[clamp(2.5rem,9vw,5rem)] leading-[0.95] font-extrabold uppercase"
            >
              The first show goes to the list first.
            </h2>
            <p className="mt-4 max-w-[60ch] text-lg">
              Dates and the room aren&apos;t public yet. People on the list get them first.
            </p>
          </div>
        </section>

        <section aria-labelledby="join2" className="bg-primary text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
            <h2
              id="join2"
              className="font-display text-[clamp(2.75rem,10vw,5.5rem)] leading-[0.92] font-extrabold uppercase"
            >
              Be first in the room.
            </h2>
            <SignupForm onDark />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink-soft sm:px-10">
        <p>
          {SITE.series} · {SITE.market}
        </p>
      </footer>
    </>
  );
}
