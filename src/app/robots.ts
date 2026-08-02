import type { MetadataRoute } from "next";

// Keep the private host-onboarding portal out of search indexes. The page
// itself is also token-gated + noindex; this is the belt-and-braces layer.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/host-onboarding/", "/api/"],
    },
    sitemap: "https://www.nomadictownies.com/sitemap.xml",
  };
}
