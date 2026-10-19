# Learning guide: how the Paradise Sessions site works

Written for Alan, who owns this project and wants to be able to explain every part of it.
Read it top to bottom once, then use it as a reference. **Claude updates this file every time a feature is added** (see the "Changelog" at the bottom), so it always matches the code.

Last updated: 2026-10-14 (covers everything built through the About, Contact, and Terms pages).

---

## 1. The big picture in one minute

The site has one job: turn a visitor into a mailing-list contact (email + ZIP code), with consent on record.

What happens when someone joins the list:

```
Visitor's phone
   │  types email + ZIP, ticks the consent box, taps "Get first access"
   ▼
Our website (hosted on Vercel, built with Next.js)
   │  1. checks it's a real person, not a bot
   │  2. checks the email and ZIP look valid
   ▼
Our database (Supabase)  ← we keep our own copy, with proof of consent
   ▼
Klaviyo (email tool)     ← the copy we send emails from
   ▼
"You're on the list" page → optional extra questions
```

Three outside services are involved. Keep these straight:

| Service | What it is | Why we use it |
|---|---|---|
| **Vercel** | Hosts the website | Makes the site available on the internet and builds a preview link for each change |
| **Supabase** | Our database (and later, logins) | We own a copy of every signup, so we never depend on Klaviyo alone |
| **Klaviyo** | Email marketing tool | Sends the emails, handles unsubscribes |

---

## 2. Vocabulary

- **Next.js**: the framework (a toolkit) the site is written in. It turns files in folders into web pages.
- **React / component**: a reusable piece of a page, like a signup form or a hero banner. Files in `src/components/`.
- **TypeScript (`.ts`, `.tsx`)**: JavaScript with labels on data ("this is an email, that is a number") so mistakes get caught before the site runs.
- **Tailwind**: a styling method where the look is written as short class names right on the element (`rounded-sm border-[3px]`).
- **Server vs. browser**: some code runs on our server (private, can hold secret keys); some runs in the visitor's browser (public, can never hold secrets).
- **Server action**: a function marked `"use server"` that a form can call directly. The form's data goes to the server, the server does the work. This is how signup and contact work.
- **Environment variable**: a setting or secret kept outside the code (like an API key). Locally in `.env.local`, in production in Vercel's settings.
- **Migration**: a numbered file that changes the database's structure. Lives in `supabase/migrations/`.
- **RLS (Row Level Security)**: a database lock that decides who can read or write each table.
- **Git / commit / branch**: git is the history of every change. A commit is one saved step. A branch is a side copy where we work without touching the main version.
- **OG image (Open Graph)**: the preview picture that appears when someone shares a link in iMessage, WhatsApp, or Messenger.
- **noindex**: a signal telling Google "do not list this site." It is on until you say go live.

---

## 3. The folder map

```
paradise-site/
├─ CLAUDE.md               Rules for Claude on this project (compliance hard stops, design, how to work with you)
├─ docs/build-directions.md  The full build spec (v2)
├─ docs/LEARNING-GUIDE.md    This file
├─ BUILD_LOG.md            One line per module built, marked Generic or Paradise-specific
├─ CODE_OWNERSHIP.md       Which code is reusable; ownership is pending counsel
├─ DEPENDENCIES.md         Open-source libraries we use and their licenses
├─ .env.example            Names of the secrets we need (no values)
├─ src/
│  ├─ app/                 Pages. A folder here = a web address.
│  ├─ components/          Reusable pieces (forms, hero banner)
│  ├─ config/              Paradise-specific words and options (brand name, language list, consent text)
│  ├─ design/tokens.css    Colors, fonts, sizes: the one place to change the look
│  └─ lib/generic/         Reusable engine code with NO Paradise names in it
└─ supabase/migrations/    Database structure files
```

**The big idea behind `lib/generic` vs. `config`:** you may later reuse this machinery for another project (build directions section 4A). So anything that knows the word "Paradise" lives in `config/` or `app/`, and anything that doesn't lives in `lib/generic/`. A test of this: searching `lib/generic` for "Paradise" should find nothing.

---

## 4. How pages work in this version of Next.js

In `src/app/`, **a folder with a `page.tsx` inside is a web address.**

| File | Address |
|---|---|
| `app/page.tsx` | `/` (home) |
| `app/join/page.tsx` | `/join` |
| `app/welcome/page.tsx` | `/welcome` |
| `app/about/page.tsx` | `/about` |
| `app/contact/page.tsx` | `/contact` |
| `app/privacy/page.tsx`, `app/terms/page.tsx` | `/privacy`, `/terms` |

`app/layout.tsx` wraps every page. It loads the three fonts, sets the site title pattern ("Page name | Paradise Sessions"), and sets the default "do not index" instruction.

Each page exports `metadata` (its browser-tab title and the description shown in search/share previews).

Note: `AGENTS.md` warns that this Next.js version (16) differs from older ones, so Claude checks the bundled docs instead of relying on memory.

---

## 5. The look: `src/design/tokens.css` and `globals.css`

All design choices are named values ("tokens") in one file:

- Colors: black background (`paper`), white text (`ink`), gray secondary text (`ink-soft`), **one gold accent** (`primary`, `#fcd116`), dark gray cards and inputs, and a coral "chili" used only for error messages.
- Fonts: **Big Shoulders** for headings, **Figtree** for body text, **Cal Sans** italic for the "Paradise Sessions" wordmark.
- Square-ish corners and a hard offset shadow (gold on cards, white on buttons) for a ticket/poster feel.

Change a value here and the whole site updates. That is what makes a future logo or palette change a one-file edit.

`globals.css` pulls in Tailwind and the tokens, makes the page dark, draws a visible gold outline on whatever is keyboard-focused (accessibility), and turns off animation for people who've asked their phone to reduce motion.

Contrast ratios are noted in a comment at the top of `tokens.css` (all pass the WCAG AA accessibility standard).

---

## 6. Safety switches (these protect you)

### 6a. Not-yet-public: the noindex system (`config/site.ts`, `robots.ts`, `next.config.ts`, `layout.tsx`)
Until you approve launch, the site tells search engines to stay away in **three** ways: a meta tag on every page, a `robots.txt` file, and an `X-Robots-Tag` header. One setting turns all three off: `ALLOW_INDEXING=true` in Vercel production. Nothing else. Going live is your decision (CLAUDE.md says to escalate it).

### 6b. The "published" flags (`config/featured-event.ts`, `components/EventHero.tsx`)
The home page has a banner under the signup box. Today there is no confirmed show, so it shows a plain "First show / Coming soon" graphic.

When a show exists later, it has `published`, `datePublic`, and `venuePublic` flags, **all false by default**. The banner code only prints a date or venue if its flag is true. This is how the compliance rules (no venue or date before a signed agreement) are enforced by the code, not just by remembering.

### 6c. The legal-name constant (`config/site.ts`)
`PRESENTER_NAME` is an empty string. Any future footer or policy will read this, so the company name can't appear anywhere until you set it in one place.

---

## 7. The signup flow, step by step

This is the most important feature. Files involved: `components/SignupForm.tsx`, `components/AttributionFields.tsx`, `app/actions.ts`, `lib/generic/signup/validate.ts`, `config/signup.ts`.

**Step 1: the form (`SignupForm.tsx`).** Fields: email, ZIP, a consent checkbox, plus language on `/join` only. It also carries a few invisible things:
- *Attribution fields* (`AttributionFields.tsx`): remembers where the visitor first came from (which ad or link, via the UTM tags in the address) and which page they landed on, and sends that along. It stores this in the browser so the *first* source survives if they browse around before signing up. This is how you'll know which QR code or post worked.
- *Honeypot*: a hidden field named "company" that real people never see. Bots fill it in, which gives them away.
- *Timer*: a form submitted in under 1.5 seconds is a bot.

**Step 2: the server action (`joinList` in `app/actions.ts`)** runs these in order:
1. **Bot check.** If it looks like a bot, send it to the thank-you page and save nothing, so the bot learns nothing.
2. **Validate** (`parseSignup`): email shape, a 5-digit ZIP, consent ticked. If not, show a friendly error.
3. **Is the database connected?** If not (e.g., before keys are set), say "the list isn't open yet" rather than pretend it worked.
4. **Save to Supabase** with the email, ZIP, language, **the exact consent wording and the time they agreed**, the page and referrer, and the UTM tags. That is our proof of consent.
5. **Already signed up?** The database refuses a duplicate email (error code 23505). We send them to the same thank-you page without saving anything and without telling them whether the email was already known. This protects other people's privacy.
6. **Sync to Klaviyo** (if keys exist). If Klaviyo fails, the person is still safely in our database, and we record "failed" so it can be retried later. We deliberately never log the error text, because it can contain the email address.
7. **Set a short-lived cookie** (1 hour, not readable by scripts) holding their new record ID, then go to `/welcome`.

**Step 3: `/welcome`** thanks them. If they have the cookie, they see `WelcomeForm`, an optional set of extra questions (name, city, genres, group size, price range, GA vs VIP, how they heard, Instagram). `saveWelcome` saves **only the fields they filled in**, so blanks never overwrite anything, and passes the same answers to Klaviyo. The cookie is what proves "this is the person who just signed up" without any login.

**Validation (`lib/generic/signup/validate.ts`)** checks every answer against allowed lists from `config/signup.ts`. Someone tampering with the form can't invent a language or a genre. The tests in `validate.test.ts` prove these rules work.

**The config (`config/signup.ts`)** holds the option lists, the consent sentence, and the label Klaviyo shows as the subscription source. The language list is marked pending native-speaker review.

---

## 8. The database (Supabase)

### The `subscribers` table (`supabase/migrations/20261013000000_create_subscribers.sql`)
One row per person. Groups of columns: identity (email, ZIP, language), **consent record** (when, and the exact text), where they came from (page, referrer, UTMs), optional answers from `/welcome`, and Klaviyo sync status.

Worth knowing:
- `email_lower` is a computed lowercase copy with a uniqueness rule, so `Sam@x.com` and `sam@x.com` count as the same person.
- A small automatic function keeps `updated_at` current.
- **RLS is on and no public access is granted.** Nobody on the internet can read or write this table directly, not even with our public key. Only our server, using the secret service key, can touch it. This keeps the list safe.

### The `contact_messages` table (`20261014000000_create_contact_messages.sql`)
Same lock, for messages sent from `/contact`. **This migration has not been run yet.**

### The three Supabase connectors (`lib/generic/supabase/`)
- `admin.ts`: server-only, uses the secret key, bypasses the locks. Used now for saving signups and messages. The `import "server-only"` line makes the build fail if anyone tries to use it in browser code.
- `server.ts` and `browser.ts`: use the public key and act as a logged-in user. **Not used yet.** They're ready for the admin area login (the next feature).

---

## 9. Klaviyo (`lib/generic/klaviyo.ts`)

Talks to Klaviyo's API in plain web requests. Three pieces:
- `klaviyoConfigured()`: are the keys present?
- `syncProfile()`: two calls. First create or update the person's profile (email, ZIP, details), then subscribe them to the list with email-marketing consent.
- `updateProperties()`: add the `/welcome` answers to an existing profile.

Whether people must click a confirmation email (double opt-in) is **a setting on the list inside Klaviyo, not in our code**. Our code just asks Klaviyo to subscribe the person; if the list is set to double opt-in, Klaviyo sends the confirmation email and only finishes subscribing them after the click. Alan believes he has switched the list to double opt-in (2026-10-14); this has not been tested yet. Klaviyo stamps the consent time itself; ours is in `subscribers.consent_at`.

---

## 10. The pages

| Page | Purpose | Notes |
|---|---|---|
| **Home** `/` | Convert. Wordmark + one line + signup (email, ZIP, consent only) above the fold, the event banner, three "what this is" blocks, a second signup, footer links | The footer nav (About, Contact, Privacy, Terms) was added with the quick pages |
| **Join** `/join` | The page every link, QR code, and bio points to | Same form plus language |
| **Welcome** `/welcome` | Thank-you + optional questions | Not for search engines |
| **About** `/about` | Who and why | **Draft copy for your approval.** Uses only facts from the brief. Ends with a signup form |
| **Contact** `/contact` | Route real inquiries | Category dropdown: Artist or comedian, Venue or room, Community organization, Press, General. **No Sponsor or Investor option** (compliance). Same bot protections as signup. Saves to `contact_messages`. Files: `ContactForm.tsx`, `contact/actions.ts`, `config/contact.ts`, `lib/generic/contact/validate.ts` (+ tests) |
| **Privacy** `/privacy`, **Terms** `/terms` | Legal pages | **Placeholders** with a "[COUNSEL REVIEW REQUIRED]" box. They name no company, as required |
| **Share image** (`opengraph-image.tsx`) | The 1200×630 black picture with the wordmark and gold bar that shows when links are shared | Generated by code, so there is no image file |

---

## 10b. The admin area (`/admin`)

**What it is:** a private part of the site for you only. Today it has a dashboard (signup counts, share inside the South Bay ZIP list, messages count, and a warning count of Klaviyo syncs that failed) and a Messages page listing what people sent through `/contact`. Events, Artists, and Landing pages will be added here next.

**How you sign in: a "magic link" (no password).**
1. You type your email at `/admin/login`.
2. The server checks the **`admins` table** (a short list of allowed emails). If you're on it, Supabase Auth emails you a one-time link. If you're not, nothing is sent, but the page says the same thing either way, so outsiders can't learn who the admins are.
3. You click the link. It lands on `/admin/auth/confirm`, which swaps the one-time code for a signed-in session (stored in a cookie) and sends you to `/admin`.
4. The link only works in the **same browser** you asked from. That's a deliberate security feature (called PKCE): a stolen link is useless on another device.

**Three layers of locking (each does a different job):**
| Layer | File | What it does |
|---|---|---|
| The "proxy" | `src/proxy.ts` + `lib/generic/supabase/proxy.ts` | Runs before any `/admin` page. Refreshes your session and bounces signed-out visitors to the login page. In this version of Next.js, "middleware" has been renamed "proxy". It's a convenience, not the real lock. |
| The guard | `lib/generic/admin/guard.ts` (`requireAdmin`) | The real lock. Every admin page asks Supabase "who is this?" and then checks that email is in `admins`. Anyone else is sent to login. |
| The database | RLS on `admins`, `subscribers`, `contact_messages` | Even if someone got past the first two, the public database key can't read these tables. |

**Pieces and where they live**
- `app/admin/login/`: login page, form, and the server action that sends the link.
- `app/admin/auth/confirm/route.ts`: receives the emailed link.
- `app/admin/(panel)/`: everything that needs sign-in. The parentheses make a "route group": it shares the guarded layout (`layout.tsx`) without adding "(panel)" to the web address. Putting the login page *outside* the group avoids a loop where the login page would demand a login.
- `config/south-bay.ts`: the ZIP list for "in the South Bay" (still to be confirmed by you, per the brief).
- `/admin` is marked noindex even after the site goes live, and `robots.txt` disallows it.

**Why the service key is used:** admin pages read the tables with the server-only key (see section 8), which is safe because the guard runs first.

## 10c. Cookie banner and analytics

**What it does:** shows a small bar at the bottom ("We use cookies for anonymous traffic stats...") with **Accept** and **Decline** (equal-size buttons). Nothing is tracked unless the visitor taps Accept. The choice is remembered in their browser (`consent_choice`).

**It is dormant right now.** It only switches on when a Google Tag Manager ID is set as `NEXT_PUBLIC_GTM_ID` (looks like `GTM-XXXXXXX`; add it in `.env.local` and in Vercel's settings). With no ID: no banner, no Google scripts, no tracking. When you get your GTM container and GA4 property (they belong in the company Google account, per the brief), that one setting turns it on.

**How the tracking works**
- **Google Tag Manager (GTM)** is a container that Google Analytics (GA4) and later the Meta Pixel plug into. The site only talks to GTM; what GTM does with it (send to GA4, etc.) is configured in GTM's own screen, not in our code.
- Our code puts events in the **data layer**, a list in the browser that GTM watches. Three events: `waitlist_submit` (new signup, with the source page), `profile_complete` (finished the optional questions), `contact_submit` (with the category, e.g. Press). **No personal data goes in any event.**
- The GTM script isn't even downloaded until someone accepts.

**The tricky one: `waitlist_submit`.** A signup is processed on the server, which then redirects, so the browser never sees it happen. So the server leaves a note in a 30-minute cookie (`pending_event`); the next page reads the note, reports the event once, and deletes it. A repeat signup with the same email leaves no note, so people aren't counted twice. If the visitor hasn't answered the banner yet, the note waits until they do.

**Files:** `components/AnalyticsRoot.tsx` (banner, GTM loading, reading the note), `lib/generic/analytics/` (`consent.ts` remembers the choice, `track.ts` sends events only if allowed, `pending.ts` the note format, with tests), and one-line hooks in `WelcomeForm`, `ContactForm`, and `app/actions.ts`.

**Changing your mind:** a "Cookie settings" link (home footer and privacy page) forgets the choice and reloads, so the banner asks again and the Google script is gone. It also only appears when analytics is switched on.

**Privacy page** was updated in the same change to describe contact messages, browser memory, the short-lived cookie, and analytics (still a placeholder for counsel).

## 10d. Events

**What you can do:** in `/admin/events`, create, edit, publish, and unpublish events. Each has a title, web address (slug), description, date and time (typed in Pacific time), venue, ticket link, and a photo with required alt text. The public site shows an events list (`/events`, with a "Past shows" archive), a page per event (`/events/[slug]`), and the home-page banner uses the next published event that has a photo.

**The compliance gate (the most important idea here).**
- Date and venue are *stored* but not *shown* unless their own checkbox ("Show the date publicly" / "Show the venue publicly") is ticked. Both default to off, and each checkbox says to tick it only after a signed agreement.
- All public pages get events through **one function**, `toPublicEvent` in `lib/generic/events/public.ts`. It strips hidden fields before a page ever sees them, so a page can't leak a date by forgetting a check. Tests prove it (a hidden venue name never appears in the output).
- The database also refuses nonsense: you can't mark a date public if there is no date, a venue public if there is no venue, or save a photo without alt text.
- **Two gaps the gate can't close**, both on you: the **title** and **description** are free text and always public once the event is published, so don't put the venue, date, or an unapproved artist name in them. The form has a reminder under Description. (Real example from testing: a title naming the venue and an artist. The fix was to unpublish.)
- Publishing makes the event public. Artist names also need the artist's written permission (CLAUDE.md).

**Times.** You type Pacific time; the database stores one exact moment (UTC); the site shows Pacific again. `lib/generic/events/zoned.ts` handles daylight saving, with tests for both summer and winter.

**Past vs upcoming.** An event is "past" only if it has a *public* date that has passed. Events without a public date stay under upcoming, so "coming soon" shows no date.

**Photos.** Upload goes to a Supabase Storage bucket called `event-images` (public to view by link; only the server can upload; JPG/PNG/WebP under 4 MB). The server checks the file's real contents, not just the label the browser gave it, and rejects anything that isn't a true JPG, PNG, or WebP. Replacing or removing a photo deletes the old file. The site's image settings (`next.config.ts`) allow loading from that bucket.

**Speed and freshness ("caching").** Public event data is remembered ("use cache") for about five minutes (the clock matters: an event moves from upcoming to past within ~5 minutes of starting) so pages load fast. When you save in admin, the site is told to forget it immediately (`updateTag("events")`), so your change shows at once. Editing the database directly (e.g. in the Supabase screen) does *not* do that, so changes made there can take up to an hour to show.

**Files:** database `supabase/migrations/20261015000000_create_events.sql`; engine `lib/generic/events/` (types, public gate, validation, time zones); wiring `lib/events.ts`; admin `app/admin/(panel)/events/`; public `app/events/`, `components/EventCard.tsx`; share image `app/events/[slug]/opengraph-image.tsx`.

## 10e. Forms keep what you typed (`usePreservedForm`)

**The problem.** React 19 empties a form after every form action, even when the server answers "fix this" (a mistyped ZIP, a missing title). Visitors lost their email, and you lost a long event you'd typed. This was found on 2026-10-15 when an event form emptied itself.

**The fix.** `lib/generic/forms/usePreservedForm.ts` submits the form through `onSubmit` instead of `action=`, so the fields stay as typed (including a chosen photo). All five forms use it: signup, welcome, contact, admin login, and event. Trade-off: the forms now need JavaScript to submit (no "plain HTML" fallback). If someone taps Submit before the page has finished loading, nothing is saved, but because the forms are marked `method="post"` their typed email can't leak into the web address.

""
## 10f. Artists

**What you can do:** in `/admin/artists`, add, edit, publish, and unpublish artists. Each has a name, web address, discipline (Music, Comedy, Dance, DJ, Other: genre-neutral on purpose), neighborhood, one line about them, links, a photo with alt text, and a permission record. The public site gets `/artists` (a photo grid, A to Z) and `/artists/[slug]` (profile with their links and a signup form tagged with that artist, so you can see whose page brought signups).

**The permission gate.** Your rule is that no artist appears publicly without written permission and their photo. It is enforced three times, so a mistake in one place can't expose someone:
1. **The admin form** refuses to save "Published" unless "Written permission on file", its date, a photo, and alt text are all present.
2. **The public gate** (`toPublicArtist` in `lib/generic/artists/public.ts`): even if a row says published, it returns nothing without permission and a photo. It also never includes the permission date.
3. **The database** has a check that refuses a published row without permission, a date, and a photo.
The site stores only the *date* of permission. Keep the actual written document (text, email, form) in your own records.

**Links.** Fixed types for the big platforms (Instagram, TikTok, YouTube, Spotify, Apple Music, SoundCloud, Facebook, Website) plus three "Anything else" slots with a name you choose (Bandcamp, a show reel...). Every link must be a full `https://` address, and each fixed type must belong to its own site (an "Instagram" link has to be on instagram.com), which catches pasted-in mistakes. Links open with `rel="noopener noreferrer"`. Stored as a list in one database column (`links`).

**Photos** use the same shared picker and uploader as events. **Auto-resize:** when you choose a photo, `components/PhotoPicker.tsx` shrinks it right in your browser (`lib/generic/images/resize.ts`): longest side at most 2000 px, re-saved as a JPEG at 85% quality, phone rotation respected. A 23 MB test photo became 1.5 MB, so the 4 MB upload limit no longer gets in the way. This has to happen in the browser, because the server never sees a file that is too big to send. The server still re-checks the size and the real file type, into a separate public bucket `artist-images`. The picture is never cropped (the site crops with CSS when it displays it). Favor warm or white-lit photos (brand color rule).

**Files:** database `supabase/migrations/20261015010000_create_artists.sql`; engine `lib/generic/artists/` (links, gate, validation) plus `lib/generic/images/` and `lib/generic/slug.ts` (shared); wiring `lib/artists.ts`; options in `config/artists.ts`; admin `app/admin/(panel)/artists/`; public `app/artists/`, `components/ArtistCard.tsx`.

## 10g. Landing pages (`/l/[slug]`) and ad-tracking readiness

**What it is:** a focused page for an ad, a QR code, or a link in a bio: a photo, a headline, one line, and the signup form, with no site navigation to pull people away. You manage them in `/admin/landing-pages`. A page can **stand alone** (a general "Join the list" page for a Facebook ad) or be **linked to an artist and/or an event**.

**The gate again.** A landing page shows only if it is published **and** everything it links to is itself public. If an artist loses "published" or permission, any landing page linked to them disappears (404) instead of naming them. Linked artists/events are read through their own gates (`getPublicArtist`, `getPublicEvent`), so no landing page can bypass the artist-permission rule. You can't publish a page whose linked artist isn't public yet. Text you type (headline, body) is free text, so the usual reminder applies: no venue, date, sponsor, or unapproved artist name until cleared.

**Photo:** the page's own, else the linked artist's, else the linked event's, else none (a type-only page).

**Search optimization (SEO), built in, per page**
- **Search title and description** boxes with live character counts and a "what it may look like in Google" preview. Blank = uses the headline and subheadline.
- **One clear heading** (the headline is the page's only H1), a short readable web address, a **canonical** link (the one official address for the page), and Open Graph/Twitter tags.
- A **share picture** generated per page (headline on black with the gold bar).
- **Structured data (JSON-LD):** every page says "I'm a WebPage of this site"; a linked event is described as an *Event* only when both its date and venue are public.
- **Sitemap** (`/sitemap.xml`): lists public pages for search engines. It is **empty until the site goes live**, and `robots.txt` points to it then. Pages with "Hide this page from search engines" ticked are left out and tagged noindex (useful for ad-only pages).
- **Never overrides "not live yet":** a page can only ever turn indexing *off*; nothing here can turn it on before you set `ALLOW_INDEXING`.
- Fast: pages are prepared ahead and cached; admin saves refresh them at once.

**Not-found pages.** An unknown landing/event/artist address shows a "not found" screen, and Next.js marks it `noindex` automatically. Because Next sends the prepared page first, the HTTP status is still 200 (a "soft 404"; Google recognises these and doesn't index them). Returning a true 404 would need a database check on every page view; we decided that isn't worth the extra load. See open item 12.

**Tracking.** Signups from a landing page are tagged `l-<slug>`, plus the ad's UTM tags (source/medium/campaign/content) as before.

**Meta (Facebook/Instagram) Pixel readiness: what is built, what is left.** You said to set it up later but correctly. Built now:
1. A **`landing_view`** analytics event (once per visit, after cookie consent, with the page's slug) for an ad tag to listen to.
2. **`waitlist_submit`** now carries an **`event_id`**, the same id stored with the signup in the database. When a browser pixel and a later server-side report (Meta's Conversions API) both send the same event id, Meta counts the conversion once.
3. The ad's **click id (`fbclid`)** is captured from the link and stored with the signup, for matching conversions to ads later. The privacy page mentions it.
4. All of it goes through Google Tag Manager, so adding the pixel won't need code changes in pages.
**Left for later (when you're ready):** create the Meta Business Manager and Pixel under the company account (see the build brief, section 4); create the GTM container (also not done yet) and add a Meta Pixel tag fired by `landing_view` and `waitlist_submit`; add the server-side Conversions API call (reads `fbclid` and `signup_event_id`); have counsel review the privacy and cookie wording for ad tracking.

**Files:** database `supabase/migrations/20261016000000_create_landing_pages.sql` (also adds `fbclid` and `signup_event_id` to subscribers); engine `lib/generic/landing/` (gate, validation, JSON-LD); wiring `lib/landing.ts`, `lib/landing-admin.ts`; admin `app/admin/(panel)/landing-pages/`; public `app/l/[slug]/`, `components/LandingView.tsx`; `app/sitemap.ts`, `app/robots.ts`.

## 10h. Header and footer

Every public page except landing pages now shares one header and one footer (`components/SiteHeader.tsx`, `components/SiteFooter.tsx`). The header has the "Paradise Sessions" wordmark (a link home), Events, Artists, About, and a Join button. On phones only the wordmark and Join show; the other links are in the footer, so there is no hamburger menu to maintain. **The home page hides the wordmark**, because its hero already carries the name (Alan's rule: the name appears once above the fold). Landing pages stay navigation-free on purpose, so an ad visitor isn't pulled away.

**How it's wired:** the inner pages moved into a folder named `app/(site)/`. The parentheses make a "route group": the folder shares one layout (`(site)/layout.tsx`, which adds the header and footer) without changing any web address. The home page, landing pages (`app/l/`), and admin sit outside that folder, so they decide for themselves. The old "Back" links on inner pages were removed, since the header replaces them.

## 11. The project paperwork

- **`CLAUDE.md`**: the standing rules Claude reads every session: the seven compliance hard stops, naming rules (never "Sama Soul", never "PH", never "Paradise Presents"), design rules, and how to work with you (plan first, small branches, screenshot every UI change, never commit secrets).
- **`docs/build-directions.md`**: the long spec, with a numbered build order (section 12).
- **`BUILD_LOG.md`**: dated list of what was built and whether each module is Generic (G) or Paradise-specific (P).
- **`CODE_OWNERSHIP.md`**: says ownership of the code is undecided and pending counsel. No license is claimed.
- **`DEPENDENCIES.md`**: every open-source library and its license.
- **`.env.example`**: the secrets the site will need (Supabase, Klaviyo, Resend keys). Real values go in `.env.local`, which git ignores (`.gitignore`), so secrets can never be committed by accident.
- **Git history**: each step is a commit with a message. Work happens on branches (the quick pages are on `quick-pages`) and nothing goes straight to `main`.

---

## 12. Testing

`npm test` runs the automated checks (vitest). There are 13+ tests covering signup rules and contact rules. They check things like "a bad email is rejected," "an unknown language is ignored," and "Sponsor is not an allowed contact category." They don't test the visual look; for that, Claude takes screenshots at phone (390px) and desktop (1440px) widths.

---

## 13. Open items (kept current)

| # | Item | Status |
|---|---|---|
| 1 | **Double opt-in.** The `/welcome` wording ("Check your email to confirm") is right only if the Klaviyo list is double opt-in. | Alan believes it's switched on. **Verify with a test signup** once Klaviyo keys are connected: the confirmation email should arrive, and the profile should stay unsubscribed until the click. |
| 2 | **Error color.** Errors use coral ("chili"). Rule clarified by Alan 2026-10-14: avoid red and blue because of gang affiliation, but an occasional use is fine as long as neither predominates. Coral is a minor, error-only use. | Low priority. Alan will revisit later. |
| 3 | **Privacy page** placeholder now covers contact messages, browser memory, the signup cookie, and analytics (updated 2026-10-14). | Counsel still has to review. Keep updating it whenever a feature collects new data. |
| 10 | **Hardening to do before launch** (from the 2026-10-14 code review, deliberately deferred): rate-limit signups and contact (bots that skip the hidden timer field are only stopped by the honeypot); retry Klaviyo syncs that failed (the dashboard counts them, nothing retries yet); restrict where the login link may point (Supabase's redirect list already limits it); `AttributionFields` remembers UTMs only from the page the visitor first loaded. | Build Order step 7 |
| 11 | **Events data check.** The first test event named a real-looking artist and venue with both public boxes ticked, and no agreement. It was set back to a draft. Before launch, review every event's title and description by hand. | Ongoing |
| 12 | **"Soft 404" on unknown event/artist/landing addresses.** The page streams a "not found" screen with HTTP status 200 (Next sends its prepared page first), but Next adds a noindex tag and Google treats these as soft 404s, so the practical harm is small. A true 404 needs a database check on every page view; decision: not worth it for now. Revisit if Search Console reports soft-404 problems after launch. | Accepted / revisit |
| 13 | **Storage limits are layered, not identical** (4 MB app limit, 4.5 MB request limit, 5 MB bucket limit). Harmless because the strictest, 4 MB, always wins, and the browser shrinks photos long before that. If a replaced photo can't be deleted from storage it stays reachable by its link: the server log records the file name, so check the logs after changing a photo for a person whose permission was withdrawn. | Note |
| 14 | **Meta Pixel** is prepared but not installed. Needs the company Meta Business Manager, a pixel, and the GTM container (see section 10g checklist). | Later |
| 9 | **No GTM/GA4 yet.** Analytics is built but dormant until `NEXT_PUBLIC_GTM_ID` is set. Needs the company Google account. | Waiting on Alan |
| 4 | **Gold-on-black check** with locals before the palette is final. | Open |
| 5 | ~~Contact migration~~ applied 2026-10-14 and tested end to end. **No email alert yet** when a message arrives (check `/admin/messages`). | Partly done |
| 7 | **Supabase email sender** is rate-limited (a few emails per hour): fine for admin sign-in, but connect Resend before real use. | Later |
| 8 | **South Bay ZIP list** (`config/south-bay.ts`) needs Alan's check. | Open |
| 6 | **Language list** awaits native-speaker review. | Open |

---

## Changelog

| Date | What changed in this guide |
|---|---|
| 2026-10-14 | First version. Explains everything built so far: scaffold, design tokens, home, signup flow, Supabase, Klaviyo, Join/Welcome/Privacy, About/Contact/Terms. |
| 2026-10-14 | Open items reworked: double opt-in is a Klaviyo setting (to verify), color rule clarified, privacy page to be kept in step with new data collection. |
| 2026-10-14 | Added section 10b: admin area, magic-link login, the three locks. Open items updated. |
| 2026-10-14 | Added section 10c: cookie banner, consent, GTM, and the three tracking events. Privacy open item updated. |
| 2026-10-14 | Code review of everything so far. Fixed: crash on a tampered cookie, no way to withdraw cookie consent, admin pages now check admin rights themselves, Klaviyo calls time out, a failed bookkeeping update no longer breaks a signup. Deferred items listed as open item 10. |
| 2026-10-15 | Added section 10d: events (admin, public pages, the date/venue gate, Pacific time, photos, caching). |
| 2026-10-15 | Added 10e: forms keep typed values on error. Photo limit is 4 MB (Next's 1 MB default was rejecting photos). Admin checks marked request-time. |
| 2026-10-15 | Events code review: strict date checking (no Feb 31), real file-type check on photos, update-of-a-missing-event handled, 5-minute event cache, forms POST-only, event page canonical/OG tags. Open item 12 added. |
| 2026-10-15 | Added section 10f: artists (permission gate in three places, fixed link types, shared image uploader). |
| 2026-10-15 | Photo picker now auto-resizes in the browser (2000 px, JPEG), shared by events and artists. |
| 2026-10-15 | Artists code review: failed reads no longer cached as "not found" (events too), Save is blocked while a photo is still being shrunk, permission dates use Pacific time, links with embedded passwords rejected and duplicates dropped, blank web address on edit keeps the current one, deleted-photo failures logged. |
| 2026-10-16 | Added 10g: landing pages with per-page SEO, sitemap, JSON-LD, ad-tracking readiness (landing_view, event_id, fbclid). Detail pages use the "check before streaming" pattern. Open item 12 reclassified. |
| 2026-10-18 | Added 10h: shared header and footer via the `(site)` route group. |
| 2026-10-18 | Landing pages + header code review: an ad click id no longer wipes a remembered campaign; web addresses can't end in a hyphen; long landing addresses keep their signup tag; home Join button scrolls to the form; one shared id check (`lib/generic/ids.ts`); brand strings from config. |
