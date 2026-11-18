import type { MetadataRoute } from "next";

// Single source of truth for robots.txt (the old static public/robots.txt was
// removed — it shadowed this route and disagreed with it). Blocks the private
// host-onboarding portal, the API, and auth/account/checkout routes (which are
// also meta-noindex) from crawling. Sitemap is generated dynamically by sitemap.ts.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/host-onboarding/",
        "/profile",
        "/payment",
        "/payment-status-check",
        "/paymentsuccess",
        "/paymentfail",
        "/booking_overview",
        "/complete-profile",
        "/auth/",
        "/email-verification",
        "/two-step-verification",
        "/two-step-code",
        "/reset-password",
        "/forget-password",
      ],
    },
    sitemap: "https://www.nomadictownies.com/sitemap.xml",
  };
}
