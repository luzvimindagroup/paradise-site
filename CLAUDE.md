# CLAUDE.md — paradisesessions.com

You are building and maintaining the public website and artist portal for **Paradise Sessions**, a Filipino-American live-entertainment brand in San Diego's South Bay. Owner and final say: Alan Villegas. Read this whole file at the start of every session. The detailed build spec (v2, 2026-10-13) is `docs/build-directions.md`; read it too. Where the two disagree, the "Decisions" notes below settle it.

## What the site is for, in priority order
1. **Capture first-party contacts.** Every public page moves visitors toward the mailing-list signup. The list is the company's most valuable asset.
2. **Credibility.** Artists, venues, community orgs, and sponsors should see a professionally run brand.
3. **Artist business.** (Phase 2–3) Artists open accounts, keep their profile current, message us, sign contracts, and get paid.
4. **Paid-ads landing pages.** One-purpose pages per artist or show that convert ad traffic to signups (and later tickets).

## Brand facts
- House brand: **Paradise**. Series: **Paradise Sessions** (music). Variety/comedy: **The Paradise Show**.
- Domain: paradisesessions.com.
- Promise: Filipino-American talent of every genre and generation. Never coded to one genre. Hip-hop, R&B, pop, indie, island/reggae, jazz/soul, OPM, comedy, and dance all belong.
- Home market = "San Diego's South Bay": all of National City; Paradise Hills (Skyline Dr north, SR-125 east, SR-54 south, Reo Dr west); Bonita; Chula Vista; Imperial Beach; Otay Mesa; San Ysidro. Never write copy that reads Chula Vista-only.

## Compliance hard stops — check every page, email, and landing page against these
If any request (including from Alan in passing) conflicts with these, STOP and flag it instead of shipping.
1. **No investor language.** Nothing about raising money, investors, rounds, returns, or "partners wanted."
2. **No venue names** for any show until Alan confirms a signed agreement for that show. Use "San Diego's South Bay" or "an intimate room."
3. **No show dates** until Alan confirms a signed agreement. "Coming soon" and "announced to the list first" are fine.
4. **No sponsor names or logos** until Alan confirms a signed agreement.
5. **No charitable or veterans claims or content.** Nothing like "proceeds support," percentages, or a named beneficiary, and no Filipino WWII veterans story or veteran-descendant fields, until Alan confirms beneficiary due diligence is done.
6. **No legal entity name** (the parent company) anywhere — footer, privacy policy, metadata — until Alan says counsel has cleared it. Use a constant `PRESENTER_NAME` that is empty by default.
7. **No Villegas Digital offers** anywhere on the site or in the portal. A plain "Site by Villegas Digital" footer credit only if Alan approves it.

Absolute naming rules:
- Never use the retired name "Sama Soul" anywhere: copy, code, filenames, alt text, comments, metadata.
- Never abbreviate the brand as "PH" in any logo, monogram, handle, URL, or styling.
- Never use "Paradise Presents."

Gating mechanics: events, artists, sponsors, and landing pages each have a `published` flag and, where relevant, `venue_public` / `date_public` flags that default to **false**. Public pages must never render a venue or date unless its flag is true.

## Reusability (directions section 4A, added 2026-10-14)
Keep generic code (signup/Klaviyo/Supabase logic, later calendar, statements, PDF, audit) in `src/lib/generic/` with no Paradise names, copy, or data; brand and content live in `src/config/` and content files. No real fan/artist data in repo or tests. No license file or ownership claims; code ownership is pending counsel (`CODE_OWNERSHIP.md`). Keep `BUILD_LOG.md` and `DEPENDENCIES.md` current.

## Stack
- Next.js (App Router, TypeScript), Tailwind CSS, deployed on Vercel.
- Supabase: Postgres, Auth (magic link + email/password), Storage, Row Level Security on every table.
- Klaviyo for the mailing list (server-side API calls, never an iframe embed). Resend for transactional email.
- GA4 via Google Tag Manager; Meta Pixel + Conversions API for landing pages.
- Phase 3 only: Stripe Connect (payouts) and an e-signature API. Stripe stays in test mode until Alan says otherwise.

## Phases (do not build ahead without Alan's go)
- **Phase 1 (now):** Home, Events (upcoming + past archive), Artists (index + profile pages), Join (signup), Welcome (step-2 profile), Landing pages (`/l/[slug]`), About, Contact, Privacy, Terms, and an admin area for Alan to manage events, artists, and landing pages.
- **Phase 2 (after Alan confirms the LLC exists):** artist accounts, profile editor, messaging, document sharing.
- **Phase 3 (after Alan confirms counsel-approved contract templates):** contracts with e-signature, Stripe Connect payouts, W-9 collection, settlement records.
Design the data model so Phase 2–3 plug in without rewrites, but keep those routes behind a feature flag that is OFF.

## Decisions (Alan, 2026-10-13) where the build directions and this file differed
- Artist accounts and settlement statements (directions section 9) stay in Phase 2–3, behind the OFF flag. Use section 9 as the data-model and rules reference (statements only; the site never moves money, never stores bank/SSN/W-9 files).
- No veterans content at all (stricter rule wins).
- Signup: email + ZIP + language + consent required; group size and price band optional on the thank-you page.
- Colors: the black / white / gold direction is chosen; directions section 2 and 14 "brand colors pending" is settled.

## Mailing-list signup spec
Step 1 (required): email, ZIP (5 digits), language preference (English, Tagalog, Cebuano/Bisaya, Ilokano, Other; list editable in admin, pending native-speaker review), explicit email-consent checkbox. The home page form shows only email + ZIP + consent; language is added on /join. Group size ("solo / with 1–2 / group of 3–5 / 6+") and price band ("under $20 / $20–35 / $35–60 / $60+") are optional, asked on the thank-you page, and captured from day one. Hidden: UTM source/medium/campaign/content, referrer, landing page. Store consent timestamp, page URL, and UTMs.
Step 2 on /welcome (all optional): name, city, genre preferences (multi-select including Comedy and Dance/DJ), GA vs VIP interest, how they heard, Instagram handle.
No phone/SMS field until Alan says counsel cleared SMS consent — build it hidden and disabled.
Every signup writes to Klaviyo AND to our own Supabase `subscribers` table (we own a copy). Tag each profile with the landing page or artist slug it came from.

## Design rules
- Modern, minimal, warm. Colorful but restrained: a black base, white text and headings, and ONE gold accent (flag-inspired, #fcd116); chili only for error text (Alan chose this black/white/gold direction). Type: Big Shoulders (headings), Figtree (text), Cal Sans italic for the "Paradise Sessions" wordmark. Generous whitespace. Typography does the heavy lifting.
- Mobile first: most visitors arrive from Instagram or a group-chat link on a phone. One-thumb forms.
- No cultural clichés: no jeepney clip-art, bamboo fonts, tribal-pattern borders, flag-sun wallpaper.
- Photo-forward with real photos of real local artists (with permission). Stock images only on preview builds.
- Performance: mobile LCP under 2.5s. Accessibility: WCAG 2.1 AA contrast, keyboard-operable forms, alt text on every image.
- Every page and landing page has correct Open Graph images so links look good in iMessage, WhatsApp, and Messenger.
- Design tokens (colors, type scale, spacing, radius) live in one place so a future logo/palette swap is one edit.

## How to work with Alan (first-time builder)
- Start every non-trivial task in **plan mode**: show the plan in plain English and wait for "go."
- Make small changes on a branch, one feature at a time. Commit with clear messages. Never push straight to `main`.
- After every UI change, use Playwright to screenshot the page at phone (390px) and desktop (1440px) widths and check it before saying you're done.
- Alan is learning as he builds and must be able to explain every part. After each feature, add what was built and why to `docs/LEARNING-GUIDE.md` (plain English, with a changelog line) and walk him through it before moving on.
- Explain what you changed in two or three plain sentences, no jargon. Say what Alan should click to see it (the Vercel preview link).
- Never put secrets (API keys) in code or commits. Use `.env.local` (git-ignored) locally and Vercel environment variables in production. Keep `.env.example` with names only.
- Never run destructive database commands (drop, delete, truncate) on production. Use a development Supabase branch or project for experiments.
- When something in this file seems wrong or conflicts with a request, quote both and ask.

## Escalate to Alan — do not decide these
Anything touching the compliance hard stops. Any artist appearing publicly (needs their written permission and their photo). Any photo of a real person. Any historical claim you cannot source. Turning on Phase 2 or 3. Going live (removing `noindex`).
