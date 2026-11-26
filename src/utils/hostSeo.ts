// Server-only SEO helpers for host profile pages. Mirrors utils/tripSeo.ts:
// prefer curated DB fields (seoTitle / metaDescription), emit ProfilePage +
// Person + BreadcrumbList JSON-LD from VERIFIED fields only. No fabricated
// ratings — aggregateRating only when real rating + reviewCount exist.
import { stripHtml, clip } from "./tripSeo";

const SITE = "https://www.nomadictownies.com";

const normSlug = (s: unknown) =>
  String(s || "")
    .replace(/^\/?hosts?\//i, "")
    .replace(/^\//, "")
    .toLowerCase()
    .trim();

export function hostName(host: any): string {
  return host?.hostName || host?.displayName || host?.hostTitle || "Verified Host";
}

export function hostTitle(host: any): string {
  const seo = String(host?.seoTitle || "").trim();
  if (seo) return seo; // DB seoTitle already carries the brand suffix
  return `${hostName(host)} - Community Host | Nomadic Townies`;
}

export function hostDescription(host: any): string {
  const meta = String(host?.metaDescription || "").trim();
  if (meta) return meta;
  const bio = clip(stripHtml(host?.shortBio || host?.hostOverview || host?.tagline));
  if (bio) return bio;
  return `Meet ${hostName(host)}, a verified local host curating community travel experiences on Nomadic Townies.`;
}

export function hostUrl(host: any, fallbackSlug?: string): string {
  const slug = normSlug(host?.seoSlug || host?._id || fallbackSlug);
  return `${SITE}/hosts/${slug}`;
}

/** Collect valid absolute social URLs from the host's socialMedia field,
 *  whatever its shape (array of strings / array of {url} / object of urls). */
function socialLinks(host: any): string[] {
  const out: string[] = [];
  const push = (v: unknown) => {
    const s = String(v || "").trim();
    if (/^https?:\/\//i.test(s)) out.push(s);
  };
  const sm = host?.socialMedia;
  if (Array.isArray(sm)) {
    sm.forEach((e: any) => (typeof e === "string" ? push(e) : push(e?.url || e?.link)));
  } else if (sm && typeof sm === "object") {
    Object.values(sm).forEach(push);
  }
  [host?.instagram, host?.facebook, host?.linkedin, host?.website].forEach(push);
  return Array.from(new Set(out));
}

export function buildHostJsonLd(host: any, fallbackSlug?: string): object {
  const url = hostUrl(host, fallbackSlug);
  const name = hostName(host);
  const description = hostDescription(host);
  const image = host?.coverImage || host?.brandingLogo || undefined;
  const sameAs = socialLinks(host);

  const person: Record<string, unknown> = {
    "@type": "Person",
    name,
    description,
    url,
    ...(image ? { image } : {}),
    ...(host?.hostTitle ? { jobTitle: host.hostTitle } : {}),
    ...(Array.isArray(host?.languages) && host.languages.length
      ? { knowsLanguage: host.languages }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: { "@type": "Organization", name: "Nomadic Townies", url: `${SITE}/` },
  };

  // Real ratings only.
  const rating = Number(host?.rating);
  const reviewCount = Number(host?.reviewCount);
  if (Number.isFinite(rating) && rating > 0 && Number.isFinite(reviewCount) && reviewCount > 0) {
    person.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
    };
  }

  const profilePage = {
    "@type": "ProfilePage",
    url,
    mainEntity: person,
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Hosts", item: `${SITE}/hosts` },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [profilePage, breadcrumb],
  };
}
