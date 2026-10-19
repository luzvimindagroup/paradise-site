import type { LimitRule } from "@/lib/generic/rate-limit/limit";

// How many attempts a visitor gets in a fixed window. Per-connection limits are high on purpose:
// a group chat, a venue's Wi-Fi, or a phone carrier can put many real people behind one address.
// The per-email limits are what stop a script from hammering one address.
export const LIMITS = {
  signupIp: { purpose: "signup-ip", windowSeconds: 10 * 60, max: 40 } satisfies LimitRule,
  signupEmail: { purpose: "signup-email", windowSeconds: 60 * 60, max: 5 } satisfies LimitRule,
  contactIp: { purpose: "contact-ip", windowSeconds: 10 * 60, max: 12 } satisfies LimitRule,
  contactEmail: { purpose: "contact-email", windowSeconds: 60 * 60, max: 4 } satisfies LimitRule,
  loginIp: { purpose: "login-ip", windowSeconds: 15 * 60, max: 8 } satisfies LimitRule,
  // Keyed on connection + email, so someone else typing the admin's email can't lock the admin out.
  loginIpEmail: { purpose: "login-ip-email", windowSeconds: 60 * 60, max: 3 } satisfies LimitRule,
} as const;

export const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
