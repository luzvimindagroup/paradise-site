import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/generic/supabase/proxy";

export function proxy(request: NextRequest) {
  return updateSession(request, {
    loginPath: "/admin/login",
    openPrefixes: ["/admin/login", "/admin/auth"],
  });
}

export const config = { matcher: "/admin/:path*" };
