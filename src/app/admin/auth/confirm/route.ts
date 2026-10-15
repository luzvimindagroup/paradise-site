import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/generic/supabase/server";

// The emailed sign-in link lands here with a one-time code.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
}
