import type { MetadataRoute } from "next";
import { ALLOW_INDEXING } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return ALLOW_INDEXING
    ? { rules: { userAgent: "*", allow: "/" } }
    : { rules: { userAgent: "*", disallow: "/" } };
}
