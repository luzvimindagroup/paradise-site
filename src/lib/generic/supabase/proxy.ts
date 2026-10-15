import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the Supabase login session fresh on each request and sends signed-out
 * visitors to the login page. This is a convenience layer only: every admin page
 * still checks admin rights itself on the server.
 */
export async function updateSession(
  request: NextRequest,
  opts: { loginPath: string; openPrefixes: string[] },
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const open = opts.openPrefixes.some((p) => path === p || path.startsWith(p + "/"));
  if (!data.user && !open) {
    return NextResponse.redirect(new URL(opts.loginPath, request.url));
  }
  return response;
}
