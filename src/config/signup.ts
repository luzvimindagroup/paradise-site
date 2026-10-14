// Signup options. Language list is pending native-speaker review and will move to admin later.
export const LANGUAGES = ["English", "Tagalog", "Cebuano/Bisaya", "Ilokano", "Other"] as const;
export const GROUP_SIZES = ["Solo", "With 1–2", "Group of 3–5", "6+"] as const;
export const PRICE_BANDS = ["Under $20", "$20–35", "$35–60", "$60+"] as const;
export const GENRES = [
  "Hip-hop", "R&B", "Pop", "Indie", "Island/Reggae", "Jazz/Soul", "OPM", "Comedy", "Dance/DJ",
] as const;
export const TICKET_INTEREST = ["General admission", "VIP", "Not sure yet"] as const;
export const HOW_HEARD = ["Instagram", "TikTok", "Friend or family", "Ad", "Event", "Other"] as const;

// Stored with every signup as the consent record. Change the text = change this version.
export const CONSENT_TEXT =
  "Yes, email me about Paradise shows and news. I can unsubscribe anytime.";

// Label shown in Klaviyo as where the subscription came from.
export const KLAVIYO_SOURCE_LABEL = "Paradise Sessions website";

export const DEFAULT_LANGUAGE = "English";
// Cookie that lets a brand-new signup fill in their own /welcome answers.
export const WELCOME_COOKIE = "ps_sub";
