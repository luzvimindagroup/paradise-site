import type { NextConfig } from "next";

// Event and artist photos live in Supabase Storage; allow next/image to load them.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

if (!supabaseHost) console.warn("NEXT_PUBLIC_SUPABASE_URL is not set: event photos will not load in this build.");

const nextConfig: NextConfig = {
  // Event photos arrive through a form action. Default limit is 1 MB; Vercel itself caps requests at 4.5 MB.
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } },
  images: {
    remotePatterns: supabaseHost
      ? ["event-images", "artist-images"].map((bucket) => ({
          protocol: "https" as const, hostname: supabaseHost, pathname: `/storage/v1/object/public/${bucket}/**`,
        }))
      : [],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    // /admin is never indexed, even after the public site goes live.
    const adminNoindex = { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] };
    if (process.env.ALLOW_INDEXING === "true") return [adminNoindex];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
