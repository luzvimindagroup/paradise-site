import {
  DEFAULT_LANGUAGE, GENRES, GROUP_SIZES, HOW_HEARD, LANGUAGES, PRICE_BANDS, TICKET_INTEREST,
} from "@/config/signup";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP = /^\d{5}$/;
const INSTAGRAM = /^[A-Za-z0-9._]{1,30}$/;

const str = (v: FormDataEntryValue | null, max = 300) => String(v ?? "").trim().slice(0, max);
const oneOf = <T extends readonly string[]>(list: T, v: string): T[number] | null =>
  (list as readonly string[]).includes(v) ? (v as T[number]) : null;

export type SignupInput = {
  email: string;
  zip: string;
  language: string;
  languageAssumed: boolean;
  pageUrl: string | null;
  referrer: string | null;
  sourceSlug: string;
  utm: { source: string | null; medium: string | null; campaign: string | null; content: string | null };
  fbclid: string | null;
};

export type FieldError = { field: "email" | "zip" | "consent"; message: string };

/** Bots fill the hidden "company" field or submit instantly. Treated as success so they learn nothing. */
export function looksLikeBot(fd: FormData, now = Date.now()): boolean {
  if (str(fd.get("company"))) return true;
  const started = Number(fd.get("started_at"));
  return Number.isFinite(started) && started > 0 && now - started < 1500;
}

export function parseSignup(fd: FormData): { ok: true; value: SignupInput } | { ok: false; error: FieldError } {
  const email = str(fd.get("email"), 254);
  const zip = str(fd.get("zip"), 5);
  if (!EMAIL.test(email)) return { ok: false, error: { field: "email", message: "Enter a valid email, like you@email.com." } };
  if (!ZIP.test(zip)) return { ok: false, error: { field: "zip", message: "Enter your 5-digit ZIP code." } };
  if (fd.get("consent") !== "on") return { ok: false, error: { field: "consent", message: "Check the box so we can email you." } };

  const picked = oneOf(LANGUAGES, str(fd.get("language")));
  const opt = (k: string) => str(fd.get(k), 200) || null;
  return {
    ok: true,
    value: {
      email, zip,
      language: picked ?? DEFAULT_LANGUAGE,
      languageAssumed: !picked,
      pageUrl: opt("landing_page"),
      referrer: opt("referrer"),
      sourceSlug: str(fd.get("source"), 80).replace(/[^a-z0-9-]/gi, "") || "home",
      fbclid: /^[A-Za-z0-9_-]{1,200}$/.test(str(fd.get("fbclid"), 200)) ? str(fd.get("fbclid"), 200) : null,
      utm: { source: opt("utm_source"), medium: opt("utm_medium"), campaign: opt("utm_campaign"), content: opt("utm_content") },
    },
  };
}

export type WelcomeInput = {
  language: string | null;
  groupSize: string | null;
  priceBand: string | null;
  name: string | null;
  city: string | null;
  genres: string[];
  ticketInterest: string | null;
  howHeard: string | null;
  instagram: string | null;
};

export function parseWelcome(fd: FormData): { ok: true; value: WelcomeInput } | { ok: false; message: string } {
  const handle = str(fd.get("instagram"), 31).replace(/^@/, "");
  if (handle && !INSTAGRAM.test(handle)) {
    return { ok: false, message: "Instagram handle can only use letters, numbers, periods and underscores." };
  }
  return {
    ok: true,
    value: {
      language: oneOf(LANGUAGES, str(fd.get("language"))),
      groupSize: oneOf(GROUP_SIZES, str(fd.get("group_size"))),
      priceBand: oneOf(PRICE_BANDS, str(fd.get("price_band"))),
      name: str(fd.get("name"), 80) || null,
      city: str(fd.get("city"), 80) || null,
      genres: fd.getAll("genres").map((g) => String(g)).filter((g): g is string => (GENRES as readonly string[]).includes(g)),
      ticketInterest: oneOf(TICKET_INTEREST, str(fd.get("ticket_interest"))),
      howHeard: oneOf(HOW_HEARD, str(fd.get("how_heard"))),
      instagram: handle || null,
    },
  };
}
