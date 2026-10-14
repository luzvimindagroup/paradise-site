# Paradise Sessions: Build Directions for Claude Code

Version: 2026-10-13 (v2, non-WordPress build). These directions replace any earlier brief if they conflict. The settlement and security rules in sections 9 and 10 take priority over everything else.

## 1. What we're building

The consumer website and artist portal for Paradise Sessions, a series of small-room (roughly 100 to 1,000 people) live music nights for Filipino-American and South Bay artists across all genres. It is not the corporate site for the parent company, which is deferred.

Primary jobs, in order:
1. Capture emails (and ZIP and language) from fans.
2. Show upcoming and past shows clearly.
3. Give each artist a public page and a private account.
4. Support per-artist landing pages for paid ads.
5. Show artists exactly what they are owed (statements only; see section 9).

## 2. Look and feel

- Colorful, but not too colorful. Modern, minimalist, clean and simple UX.
- Mobile-first. Most visitors arrive from Instagram or ads on a phone.
- Genre-neutral. Do not style the site around any one genre, including hip-hop.
- Accessible: good contrast, keyboard navigation, alt text, readable type sizes.
- Fast: compress images, lazy-load, avoid heavy sliders and autoplay.
- Do not use the letters "PH" as a mark or logo.

## 3. Stack (default; Alan confirms before you lock it in)

This build is outside WordPress. Propose this stack first, wait for Alan's yes, then proceed:

- **Framework:** Next.js with TypeScript (App Router), server-rendered for speed and SEO.
- **Database and auth:** Postgres with row-level security. Supabase is the default (database, auth, file storage). Artist-only access is enforced in the database with row-level security policies, not only in application code.
- **Hosting:** Vercel for the app, with the domain paradisesessions.com. Staging and production environments kept separate.
- **Email:** Klaviyo for fan lists and campaigns. Transactional email (login links, statement notices) through a separate transactional service such as Resend or Postmark.
- **PDFs:** server-side PDF generation for statements.
- **Styling:** Tailwind CSS with a small design-token file (colors, type, spacing) so the look can change in one place.
- **Admin:** build a protected admin area in the same app. There is no WordPress dashboard, so every content type needs an admin screen: shows, artists, signups, statements. Add CSV export of signups.
- **Accounts:** the domain, hosting, database, email, and analytics accounts must all be registered to the company-controlled email (luzviminda.group@gmail.com). Villegas Digital gets delegated access only. List every account created in a file named ACCOUNTS.md (names and purposes only, never credentials).

Explain each choice in plain language when you propose it. Alan is new to Claude Code, so favor boring, well-documented tools over clever ones.

## 4. Working method

- Use a Git repository with small, clear commits. Never commit secrets. Keep a `.env.example` listing required variables with blank values.
- Write database changes as migrations, not manual edits, so the database can be rebuilt.
- Add automated tests for permissions, statement math, and the signup flow.
- After each build step in section 12, stop and summarize: what works, what is a placeholder, and what Alan must decide or do (for example, create an account).
- Keep a `README.md` that explains how to run the project locally and how to deploy.
- Prefer asking Alan one clear question over guessing on anything in section 14.

## 4A. Reusability: keep generic code separate from Paradise-specific code

Why: Alan may later reuse the generic parts for Villegas Digital client sites. Paradise and Villegas Digital are separate businesses, so the boundary has to be clean from the start. Do not build multi-customer features; this is only about separation.

- **Generic modules (reusable):** event calendar logic, signup and RSVP/waitlist flow, artist profile structure, landing-page template, statement calculation, PDF export, permission and audit-log patterns. Put these in clearly named, self-contained folders (for example `/lib/generic/` or `/packages/core/`) with no Paradise names, copy, or data inside.
- **Paradise-specific content (stays with Paradise):** brand name, logo, colors, copy, artist records, fan and signup data, show data, flyers and photos, tracking IDs, and any contract or policy text. Put these in separate config and content files (for example `/config/paradise.ts` and `/content/`), not inside the generic modules.
- **Configuration, not hardcoding:** the generic modules read brand name, colors, language list, email-service keys, and legal text from configuration. A search of the generic folders for "Paradise" or "Luzviminda" should return nothing.
- **No customer data in the repo:** no real fan emails, artist details, or statements in source control, seed files, or tests. Use fake sample data only.
- **Licensing and ownership notes:** do not add a license file or claim ownership in file headers. Ownership of the code (Luzviminda Group or Villegas Digital) is an open question for counsel; see section 14. Keep a `CODE_OWNERSHIP.md` stub that says "ownership pending counsel" and lists which folders are generic and which are Paradise-specific.
- **Build log:** keep a `BUILD_LOG.md` that records each module built, the date, and whether it is generic or Paradise-specific. It will help write the case study and any later client proposal.
- **Dependencies:** prefer open-source libraries with permissive licenses, and list each one with its license in `DEPENDENCIES.md`, so reuse does not hit licensing surprises later.

## 5. Public pages

**Home.** Lead with the next shows in a date-sorted list, one clear button per show, and an email signup. Short one-line description of the series. No long SEO paragraphs.

**Calendar.** Upcoming shows, then a past-events archive with date, venue name (when allowed; see section 11), lineup, and photos once available. Filters by month and by artist.

**Event page (one per show).** Flyer, date, time, lineup with links to artist pages, venue name and address (only once a written agreement allows it), one primary button, and a signup. The button is one of: Tickets (external link), Free RSVP, or Join Waitlist (when sold out). Add a field for the external ticket URL. Do not build ticketing.

**Artists.** Roster page and one public page per artist: photo, short bio, genre tags (multiple allowed), links, upcoming and past shows, and a "get notified when they play" signup.

**About and Contact.** Plain language. No investor language of any kind.

**SEO basics:** clean URLs, page titles and descriptions per page, structured data for events, a sitemap, and social preview images. Write natural copy; do not stuff keywords.

## 6. Signup, RSVP, and waitlist

- Required fields: email, ZIP code, language preference (English, Tagalog, Cebuano/Bisaya, Ilokano, Other). Make the language list editable in admin because it is pending a native-speaker review.
- Optional fields after signup, on the thank-you page: group size and price-band interest. Add these from day one because they cannot be backfilled.
- Email only for now. Do not collect SMS numbers until counsel approves the consent language.
- Store the signup source: page, artist (if from an artist landing page), and UTM parameters.
- Sync to Klaviyo with tags for artist interest and show interest. Keep the database as the source of truth so the list is owned and exportable.
- Free RSVP and Waitlist use the same capture flow with different labels.
- Sold-out shows show a waitlist button instead of a ticket button.
- Add bot protection (a honeypot field or a CAPTCHA-free alternative) and rate limiting on the signup endpoint.

## 7. Per-artist landing pages for paid ads

- One lightweight page per artist: hero image, one line about them, next show, one signup or ticket button. No site navigation, to keep the click focused.
- Each page accepts UTM parameters and records them with the signup.
- Pages must not expose any private artist, statement, or payment data.
- Keep each page small and fast.

## 8. Tracking and privacy

- Set up Google Tag Manager and GA4. Load ad pixels (including Meta) only after consent through a cookie banner.
- Provide a privacy policy and a "Do Not Sell or Share" link. Mark the legal text [COUNSEL REVIEW REQUIRED].
- Track: signups by source, signup cost by channel, ticket-button clicks, waitlist joins, and signups by ZIP.
- Do not send names or emails to ad platforms without explicit consent and counsel approval.

## 9. Artist accounts and settlement statements (Phase 1)

Goal: artists log in and see exactly what they are owed for each show, with the math, the status, and a record of payment. The site is the transparent record. It is not where money moves.

**Hard rules:**
1. The site never holds, receives, or transfers money. No payout buttons, wallets, or balances that imply stored funds.
2. Never store bank account or routing numbers, SSNs/EINs, card numbers, or government IDs. Not in the database, files, or logs.
3. Payment method is a label only (Zelle, Venmo, Check, Cash) plus an optional short reference note. No underlying account details.
4. Track W-9 status as a flag with a date. Do not upload, display, or store the W-9 itself.
5. Contracts: store a status and a link to the signed copy kept in a company-controlled system. Contract templates and terms are placeholders marked [COUNSEL REVIEW REQUIRED].
6. All legal copy is placeholder text until counsel replaces it.

**Roles:**
- Artist: sees only their own profile, shows, statements, and messages. Read-only on statements; can mark Reviewed or Disputed with a note.
- Admin (company): creates shows, drafts and edits statements, sets status, records payments.
- Villegas Digital (delegated): build and maintenance access; cannot alter an Approved statement without an audit entry.
- Enforce permissions in the database (row-level security) and again on the server for every request. Hiding buttons is not security.

**Data model (platform-neutral):**
- Artist: id, display name, contact email, genre tags, W-9 status flag and date, payment-method label, created date.
- Show: id, title, date, venue name, status, ticket URL, capacity.
- Statement (one per artist per show): show_id, artist_id, deal_type (flat guarantee, door split, hybrid), gross_door, ticket_fees, venue_cut, approved_expenses[] (label and amount), artist_share_percent, guarantee_amount, amount_owed (calculated, never typed), status (Draft, Sent to Artist, Artist Reviewed, Approved, Paid, Disputed), payment_method_label, payment_reference_note, paid_date, notes visible to the artist.
- AuditLog: who changed what field, old value, new value, timestamp. Entries cannot be edited or deleted (enforce this in the database).

**Behavior:**
- Calculate amount_owed on the server. Show each line and the formula in plain language. Use integer cents internally to avoid rounding errors; round only at the final step.
- Workflow: Draft, then Sent to Artist (the email notice contains a login link, not the figures), then Reviewed or Disputed, then Approved, then Paid (payment is made outside the site and recorded here).
- Once Approved, financial fields are locked. Changes create a new revision; the old one stays in the audit log.
- Artists can download a PDF of each statement showing show, date, line items, formula, status, and paid date, with the placeholder footer [COUNSEL REVIEW REQUIRED].
- Messaging: per-show announcements to artists by email, plus a simple message thread per show inside the account. Keep it basic.

**Phase 2 (design for it, do not build it):** later, a licensed processor (for example Stripe Connect Express) may handle payouts and tax onboarding. Add nullable fields payout_provider and payout_reference now, unused. Do not add payout code, keys, or webhooks. Phase 2 starts only after the entity exists, counsel has reviewed the payout structure, and a company bank account is open.

## 10. Security and logging

- HTTPS only. Rate-limit login and signup. Use magic-link or strong-password login, and offer two-step verification for admin accounts.
- Never log request bodies for account or statement endpoints. Never write financial values or personal data to error logs or analytics.
- All secrets in environment configuration, never in code or the repository.
- Scheduled database backups; document the restore steps in the README and test one restore.
- Test that one artist cannot open another artist's statement by changing an ID in the URL, and that signed-out visitors cannot reach any private route.
- Keep dependencies updated and run a dependency vulnerability check before each deploy.

## 11. Compliance hard stops (apply to all copy, images, metadata, and seed data)

- Do not name any specific venue until a written agreement exists.
- Do not publish dates or sponsor logos before signed agreements.
- No investor solicitation language anywhere on the site.
- No charitable or veterans claims before the beneficiary due diligence is done.
- Placeholder content must be visibly marked in the admin and must not go live. Add a publish flag on every public content type, defaulting to unpublished.

## 12. Build order

1. Proposal: confirm the stack in section 3 with Alan, then set up the repository, environments, accounts list, and design tokens.
2. Foundation: hosting under the company email, database and migrations, authentication, admin shell, cookie banner, privacy page placeholder.
3. Public pages: home, calendar with past-events archive, event page, artists roster and artist page, with admin screens to manage each.
4. Signup and RSVP/waitlist flow with Klaviyo sync, source tracking, and signup CSV export.
5. Per-artist landing page template.
6. Artist accounts, then statements, then PDF export, then audit log.
7. Security checks, permission tests, backup test, accessibility and speed check, and a full review against section 11.
Stop after each step and summarize.

## 13. Definition of done

- A fan can find the next show, join the list or waitlist, and see past shows, on a phone, in a few taps.
- Each artist has a public page and a landing page that records the source of every signup.
- An artist can log in, see only their own statements, review the math, and download a PDF.
- An admin can draft, send, approve, and mark a statement paid, and every change appears in the audit log.
- A search of the codebase and database finds no bank numbers, SSNs, or stored W-9 files.
- No venue names, sponsor logos, or investor language appear on the live site.
- The README lets someone else run, deploy, and restore the project.
- Generic modules contain no Paradise names, data, or copy, and `CODE_OWNERSHIP.md`, `BUILD_LOG.md`, and `DEPENDENCIES.md` exist and are current.

## 14. Open items for Alan (do not decide these yourself)

- Confirmation of the stack in section 3.
- Which payment methods the first artists want.
- Counsel and accountant sign-off on 1099 handling, payment-policy copy, and SMS consent language.
- Which ticketing platform to link to (questions to ask: fee for a small room, buyer email export with consent, acceptance of a first-time promoter).
- Final language list for signup, pending native-speaker review.
- Brand colors and logo, once the Paradise identity is finalized.
- Which entity owns the code (Luzviminda Group or Villegas Digital), and the written IP assignment and license terms, with counsel. Do not decide this yourself.
