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
