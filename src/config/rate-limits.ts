import type { LimitRule } from "@/lib/generic/rate-limit/limit";

// How many attempts one visitor gets. Generous for real people, tight for scripts.
export const LIMITS = {
  signup: { purpose: "signup", windowSeconds: 10 * 60, max: 6 } satisfies LimitRule,
  contact: { purpose: "contact", windowSeconds: 10 * 60, max: 4 } satisfies LimitRule,
  loginIp: { purpose: "login-ip", windowSeconds: 15 * 60, max: 5 } satisfies LimitRule,
  loginEmail: { purpose: "login-email", windowSeconds: 60 * 60, max: 3 } satisfies LimitRule,
} as const;

export const TOO_MANY = "Too many attempts from your connection. Please wait a few minutes and try again.";
