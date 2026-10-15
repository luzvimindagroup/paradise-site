# Code ownership

**Ownership pending counsel.** Whether Luzviminda Group or Villegas Digital owns this code, and the written IP assignment and license terms, is an open question for counsel (directions section 14). Nothing in this repo claims ownership or adds a license.

## Folder map

**Generic (reusable, no brand names, copy, or data):**
- `src/lib/generic/klaviyo.ts` — Klaviyo profile sync and subscribe
- `src/lib/generic/signup/` — signup and welcome validation, bot checks
- `src/lib/generic/admin/` — admin guard (who may use /admin)
- `src/lib/generic/contact/` — contact-form validation
- `src/lib/generic/supabase/` — Supabase clients (admin, server, browser)

**Paradise-specific (stays with Paradise):**
- `src/config/` — brand names, South Bay ZIP list, signup options and consent text, featured event, feature flags
- `src/design/tokens.css` — palette and type
- `src/app/` pages and copy, `src/components/` (current UI carries Paradise styling and copy)
- `supabase/migrations/` — schema as built for Paradise
- `public/`, fonts, OG image, `.env*` values

Rule: a search of the generic folders for "Paradise" or "Luzviminda" must return nothing. Generic code reads brand, language lists, and keys from config or environment.
