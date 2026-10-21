// Empty on purpose: no legal entity name anywhere until Alan says counsel cleared it.
export const PRESENTER_NAME = "";

// Plain footer credit, approved by Alan 2026-10-21. Text only: no link, no offer.
export const SITE_CREDIT = "Site by Villegas Digital";

export const SITE = {
  house: "Paradise",
  series: "Paradise Sessions",
  variety: "The Paradise Show",
  domain: "paradisesessions.com",
  market: "San Diego's South Bay",
} as const;

// Event times are typed and shown in this zone (daylight saving handled automatically).
export const TIMEZONE = "America/Los_Angeles";

// Phase 2 (artist accounts) and Phase 3 (contracts, payouts) stay OFF until Alan says go.
export const FEATURES = {
  phase2: false,
  phase3: false,
} as const;

// Site-wide noindex stays on until Alan approves going live.
// Going live = setting ALLOW_INDEXING=true in Vercel production, nothing else.
export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";
