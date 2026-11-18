import type { MetadataRoute } from "next";

// ─────────────────────────────────────────────────────────────
// Dynamic sitemap. Static marketing pages + live published trips,
// blogs, hosts and categories pulled from the API. Only indexable
// 200 pages (auth/account/checkout routes are excluded — those carry
// meta robots noindex and never belong in the sitemap). Any API
// failure degrades gracefully to the static set so the build never breaks.
// ─────────────────────────────────────────────────────────────

const SITE = "https://www.nomadictownies.com";
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.nomadictownies.com/api";

const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type Row = Record<string, unknown>;
async function getList(path: string): Promise<Row[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const d = json?.data ?? json;
    return Array.isArray(d) ? d : Array.isArray(d?.trips) ? d.trips : [];
  } catch {
    return [];
  }
}

const date = (r: Row) => {
  const v = (r.updatedAt || r.createdAt || r.Date) as string | undefined;
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/experiences`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/hosts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/become-a-host`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/about-us`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/contact-us`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/careers`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/cancellation-and-refund`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [trips, blogs, hosts, categories] = await Promise.all([
    getList("/GetAllTripsForUser"),
    getList("/getAllBlogs"),
    getList("/host/"),
    getList("/getAllCategories"),
  ]);

  const tripUrls: MetadataRoute.Sitemap = trips
    .map((t) => {
      const activeSlug = (t.seoSlug as string) || (t._id as string);
      if (!activeSlug) return null;
      const dest = slugify((t.location as string) || (t.destination as string) || "trips");
      return { url: `${SITE}/trips/${dest}/${activeSlug}`, lastModified: date(t), changeFrequency: "weekly" as const, priority: 0.8 };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const blogUrls: MetadataRoute.Sitemap = blogs
    .map((b) => {
      const slug = (b.seoSlug as string) || (b._id as string);
      return slug ? { url: `${SITE}/blog/${slug}`, lastModified: date(b), changeFrequency: "monthly" as const, priority: 0.6 } : null;
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const hostUrls: MetadataRoute.Sitemap = hosts
    .map((h) => {
      const slug = (h.seoSlug as string) || (h._id as string);
      return slug ? { url: `${SITE}/hosts/${slug}`, lastModified: date(h), changeFrequency: "weekly" as const, priority: 0.6 } : null;
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  // Category landing pages live at /trips/<slug> (the /category/* route is a
  // 308 redirect, so it must never appear in the sitemap).
  const categoryUrls: MetadataRoute.Sitemap = categories
    .map((c) => {
      const slug = slugify((c.name as string) || (c.categoryName as string) || (c.seoSlug as string) || "");
      return slug ? { url: `${SITE}/trips/${slug}`, changeFrequency: "weekly" as const, priority: 0.6 } : null;
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  return [...staticPages, ...tripUrls, ...blogUrls, ...hostUrls, ...categoryUrls];
}
