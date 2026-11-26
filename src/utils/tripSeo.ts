// Server-only SEO helpers for trip pages. No React, no client APIs — safe to
// import from a Server Component. Keeps `generateMetadata` and JSON-LD in sync
// and ensures we only ever emit VERIFIED data (no fabricated reviews/ratings).

const SITE = "https://www.nomadictownies.com";

/** Strip HTML tags + collapse whitespace. Used to derive a clean meta
 *  description from the rich-text `overview` when no `metaDescription` is set. */
export function stripHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate to a whole-word boundary at/under `max` chars (default 155 for
 *  meta descriptions). */
export function clip(text: string, max = 155): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

/** Prefer the curated DB fields, then fall back gracefully. */
export function tripTitle(trip: any): string {
  const seo = String(trip?.seoTitle || "").trim();
  if (seo) return seo; // DB seoTitle already carries the brand suffix
  return `${trip?.title || "Adventure Trip"} | Nomadic Townies`;
}

export function tripDescription(trip: any): string {
  const meta = String(trip?.metaDescription || "").trim();
  if (meta) return meta;
  const fromOverview = clip(stripHtml(trip?.overview));
  if (fromOverview) return fromOverview;
  return `Join ${trip?.title || "this unique community trip"} with Nomadic Townies.`;
}

const slugify = (s: unknown) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function tripUrl(trip: any): string {
  const dest = slugify(trip?.location || trip?.destination || "trip");
  const slug = trip?.seoSlug || trip?._id;
  return `${SITE}/trips/${dest}/${slug}`;
}

/** Earliest upcoming batch start date (ISO yyyy-mm-dd) if any, for Offer.validFrom. */
function firstBatchDate(trip: any): string | undefined {
  const dates: string[] = Array.isArray(trip?.selectDate)
    ? trip.selectDate.map((b: any) => b?.BatchDate).filter(Boolean)
    : [];
  const sorted = dates.sort();
  return sorted[0];
}

/** Total remaining seats across batches (verified availability), for Offer.availability. */
function remainingSeats(trip: any): number | undefined {
  if (Array.isArray(trip?.batchAvailability)) {
    return trip.batchAvailability.reduce(
      (n: number, b: any) => n + (Number(b?.remaining) || 0),
      0
    );
  }
  return undefined;
}

/**
 * Build TouristTrip + BreadcrumbList JSON-LD from VERIFIED fields only.
 * Emits aggregateRating ONLY when real ratings/reviews exist — never fabricated.
 * Returns a plain object ready for JSON.stringify.
 */
export function buildTripJsonLd(trip: any, reviews: any[] = []): object {
  const url = tripUrl(trip);
  const name = String(trip?.title || "Community Trip").trim();
  const description = tripDescription(trip);
  const image =
    trip?.bannerImage ||
    trip?.cardImage ||
    (Array.isArray(trip?.tripImages) ? trip.tripImages[0] : undefined) ||
    (Array.isArray(trip?.gallaryImages) ? trip.gallaryImages[0] : undefined);

  const price = Number(trip?.price);
  const validFrom = firstBatchDate(trip);
  const remaining = remainingSeats(trip);

  const offer: Record<string, unknown> = {};
  if (Number.isFinite(price) && price > 0) {
    offer["@type"] = "Offer";
    offer.price = price;
    offer.priceCurrency = "INR";
    offer.url = url;
    offer.availability =
      remaining === undefined
        ? "https://schema.org/InStock"
        : remaining > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut";
    if (validFrom) offer.validFrom = validFrom;
  }

  const touristTrip: Record<string, unknown> = {
    "@type": "TouristTrip",
    name,
    description,
    url,
    ...(image ? { image } : {}),
    ...(trip?.location ? { touristType: "Group travellers" } : {}),
    provider: {
      "@type": "Organization",
      name: "Nomadic Townies",
      url: `${SITE}/`,
    },
  };
  if (Object.keys(offer).length) touristTrip.offers = offer;

  // Real ratings only. `ratings` numeric + at least one review.
  const rating = Number(trip?.ratings);
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
  if (Number.isFinite(rating) && rating > 0 && reviewCount > 0) {
    touristTrip.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
    };
  }

  const dest = slugify(trip?.location || trip?.destination || "Trips");
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Experiences", item: `${SITE}/experiences` },
      {
        "@type": "ListItem",
        position: 3,
        name: trip?.location || "Trip",
        item: `${SITE}/trips/${dest}`,
      },
      { "@type": "ListItem", position: 4, name, item: url },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [touristTrip, breadcrumb],
  };
}
