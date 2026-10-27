import type { MetadataRoute } from "next";

// Fictional demo content must not be presented as an operating local business.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
