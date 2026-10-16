import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return ALLOW_INDEXING
    ? { rules: { userAgent: "*", allow: "/", disallow: "/admin" }, sitemap: `https://${SITE.domain}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
