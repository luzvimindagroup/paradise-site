# Build log

Each module built, its date, and whether it is generic (G) or Paradise-specific (P).

| Date | Module | Type |
|---|---|---|
| 2026-10-13 | Project scaffold, design tokens (`src/design/tokens.css`) | P |
| 2026-10-13 | Home page, EventHero, SignupForm UI, OG image | P |
| 2026-10-13 | Supabase `subscribers` migration and admin client | G (schema as built for Paradise) |
| 2026-10-13 | Signup validation and bot checks (`src/lib/generic/signup/`) | G |
| 2026-10-14 | Klaviyo sync (`src/lib/generic/klaviyo.ts`), source label now from config | G |
| 2026-10-13 | `/join`, `/welcome`, `/privacy` placeholder, attribution capture | P |
| 2026-10-14 | Reusability split: generic code moved to `src/lib/generic/` | G |
| 2026-10-14 | Contact form + validation (`src/lib/generic/contact/`), `contact_messages` migration | G |
| 2026-10-14 | `/about`, `/contact`, `/terms` placeholder, footer links | P |
| 2026-10-14 | Learning guide (`docs/LEARNING-GUIDE.md`) | P |
| 2026-10-14 | Admin shell: magic-link login, guard, proxy, dashboard, messages (`src/app/admin/`, `src/lib/generic/admin/`), `admins` migration | G (guard, proxy) / P (pages) |
| 2026-10-14 | Cookie banner, consent, GTM data-layer events (`src/lib/generic/analytics/`, `AnalyticsRoot`); privacy placeholder updated | G (lib) / P (banner copy) |
