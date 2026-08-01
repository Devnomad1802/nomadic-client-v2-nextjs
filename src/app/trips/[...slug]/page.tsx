import React from "react";
import TripDetail from "@/PageComponents/TripDetail";
import CategorieDetails from "@/Component/Home/CategorieDetails";
import { getTrips, getReviews, getCategories } from "@/utils/serverFetch";
import { matchTemplate } from "@/Component/Home/categoryCards";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const FALLBACK_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const norm = (s: string) => (s || "").toLowerCase().trim();

const slugify = (str: string) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseCats = (v: any) => {
  const out: string[] = [];
  const walk = (x: any) => {
    if (Array.isArray(x)) return x.forEach(walk);
    if (typeof x !== "string") return;
    const s = x.trim();
    if (/^\[.*\]$/.test(s)) {
      try { return walk(JSON.parse(s)); } catch { /* noop */ }
    }
    out.push(s.replace(/[[\]"]/g, "").trim());
  };
  walk(v);
  return out.filter(Boolean);
};

const normSlug = (s: any) => String(s || "").replace(/^\/?hosts?\//i, "").replace(/^\//, "").toLowerCase().trim();

const isTripForHost = (trip: any, param: string) => {
  if (!trip || !param) return false;
  const pSlug = slugify(param);
  const pNorm = norm(param);
  const pClean = normSlug(param);

  const tripHost = trip.host;
  if (!tripHost) return false;

  if (typeof tripHost === "string" || typeof tripHost === "number") {
    const hStr = `${tripHost}`;
    if (hStr === `${param}` || normSlug(hStr) === pClean || slugify(hStr) === pSlug) return true;
  }
  if (typeof tripHost === "object") {
    const hId = `${tripHost._id || tripHost.id || ""}`;
    const hSlug = normSlug(tripHost.seoSlug || tripHost.hostTitle || tripHost.hostName || "");
    if (hId && (hId === param || normSlug(hId) === pClean)) return true;
    if (hSlug && (hSlug === pClean || slugify(hSlug) === pSlug || norm(hSlug) === pNorm)) return true;
    if (tripHost.hostTitle && (slugify(tripHost.hostTitle) === pSlug || normSlug(tripHost.hostTitle) === pClean)) return true;
    if (tripHost.hostName && (slugify(tripHost.hostName) === pSlug || normSlug(tripHost.hostName) === pClean)) return true;
  }
  return false;
};

const isTripInCategory = (trip: any, param: string) => {
  if (!trip || !param) return false;
  if (isTripForHost(trip, param)) return true;
  const pSlug = slugify(param);
  const pNorm = norm(param);

  if (trip.location && (slugify(trip.location) === pSlug || norm(trip.location) === pNorm)) return true;
  if (trip.destination && (slugify(trip.destination) === pSlug || norm(trip.destination) === pNorm)) return true;
  const cats = parseCats(trip.categories);
  if (cats.some((c) => slugify(c) === pSlug || norm(c) === pNorm)) return true;
  if (trip.category && (slugify(trip.category) === pSlug || norm(trip.category) === pNorm)) return true;
  if (trip.categoryName && (slugify(trip.categoryName) === pSlug || norm(trip.categoryName) === pNorm)) return true;
  if (trip.title && slugify(trip.title).includes(pSlug)) return true;

  return false;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugArray = Array.isArray(slug) ? slug : [slug];

  if (slugArray.length === 1) {
    const singleParam = decodeURIComponent(slugArray[0]);
    const tripsRes = await getTrips();
    const list = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
    const isSingleTrip = list.find((t: any) => t.seoSlug === singleParam || t._id === singleParam);

    if (isSingleTrip) {
      const activeSlug = isSingleTrip.seoSlug || isSingleTrip._id;
      const destSlug = slugify(isSingleTrip.location || isSingleTrip.destination || "trip");
      const pageUrl = `https://www.nomadictownies.com/trips/${destSlug}/${activeSlug}`;
      const ogImage = isSingleTrip.tripImages?.[0] || isSingleTrip.coverImage || isSingleTrip.Banner_Image || FALLBACK_IMAGE;
      const description =
        isSingleTrip.description ||
        isSingleTrip.shortDescription ||
        `Join ${isSingleTrip.title || "this unique community trip"} with Nomadic Townies.`;

      return {
        title: `${isSingleTrip.title || "Adventure Trip"} | Nomadic Townies`,
        description,
        alternates: { canonical: pageUrl },
        openGraph: {
          type: "article",
          url: pageUrl,
          siteName: "Nomadic Townies",
          title: `${isSingleTrip.title || "Adventure Trip"} | Nomadic Townies`,
          description,
          images: [{ url: ogImage, width: 1200, height: 630, alt: isSingleTrip.title || "Nomadic Townies Trip" }],
          locale: "en_IN",
        },
        twitter: {
          card: "summary_large_image",
          title: `${isSingleTrip.title || "Adventure Trip"} | Nomadic Townies`,
          description,
          images: [ogImage],
        },
      };
    }

    // Category / Location metadata
    const catRes = await getCategories();
    const cats = Array.isArray(catRes?.data) ? catRes.data : [];
    const catDoc = cats.find((c: any) => norm(c?.Category) === norm(singleParam));
    const tpl = matchTemplate(catDoc?.Category || singleParam) as any;
    const displayName = tpl.name || catDoc?.Category || singleParam.charAt(0).toUpperCase() + singleParam.slice(1);
    const pageUrl = `https://www.nomadictownies.com/trips/${slugArray[0]}`;
    const description = `Explore the best curated ${displayName} travel experiences, community trips, and retreats with Nomadic Townies.`;

    return {
      title: `${displayName} Travel Experiences | Nomadic Townies`,
      description,
      alternates: { canonical: pageUrl },
      openGraph: {
        type: "website",
        url: pageUrl,
        siteName: "Nomadic Townies",
        title: `${displayName} Travel Experiences | Nomadic Townies`,
        description,
        images: [{ url: FALLBACK_IMAGE, width: 1200, height: 630, alt: `${displayName} — Nomadic Townies` }],
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title: `${displayName} Travel Experiences | Nomadic Townies`,
        description,
        images: [FALLBACK_IMAGE],
      },
    };
  }

  // 2-segment trip metadata (/trips/bhutan/explore-bhutan-magic-7-day-tour)
  const targetSlug = slugArray[slugArray.length - 1];
  const decodedSlug = decodeURIComponent(targetSlug);
  const tripsRes = await getTrips();
  const list = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
  const trip = list.find((t: any) => t.seoSlug === decodedSlug) || list.find((t: any) => t._id === decodedSlug);

  if (!trip) {
    return {
      title: "Trip Experience Not Found | Nomadic Townies",
      description: "This travel experience could not be found.",
      robots: "noindex",
    };
  }

  const activeSlug = trip.seoSlug || trip._id || targetSlug;
  const destSlug = slugify(trip.location || trip.destination || "trip");
  const pageUrl = `https://www.nomadictownies.com/trips/${destSlug}/${activeSlug}`;
  const ogImage = trip.tripImages?.[0] || trip.coverImage || trip.Banner_Image || FALLBACK_IMAGE;
  const description =
    trip.description ||
    trip.shortDescription ||
    `Join ${trip.title || "this unique community trip"} with Nomadic Townies.`;

  return {
    title: `${trip.title || "Adventure Trip"} | Nomadic Townies`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      url: pageUrl,
      siteName: "Nomadic Townies",
      title: `${trip.title || "Adventure Trip"} | Nomadic Townies`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: trip.title || "Nomadic Townies Trip" }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${trip.title || "Adventure Trip"} | Nomadic Townies`,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const slugArray = Array.isArray(slug) ? slug : [slug];

  if (slugArray.length === 1) {
    const singleParam = decodeURIComponent(slugArray[0]);
    const [allTripsRes, catsRes, reviewsRes] = await Promise.all([
      getTrips(),
      getCategories(),
      getReviews(),
    ]);

    const allTrips = Array.isArray(allTripsRes?.data) ? allTripsRes.data : [];
    const isSingleTrip = allTrips.find((t: any) => t.seoSlug === singleParam || t._id === singleParam);

    // If single trip slug (e.g. /trips/explore-bhutan-magic-7-day-tour), redirect to /trips/bhutan/explore-bhutan-magic-7-day-tour
    if (isSingleTrip) {
      const destSlug = slugify(isSingleTrip.location || isSingleTrip.destination || "trip");
      redirect(`/trips/${destSlug}/${isSingleTrip.seoSlug || isSingleTrip._id}`);
    }

    // Filter trips for the location / category (e.g. /trips/bhutan, /trips/andaman)
    const categoryTrips = allTrips.filter((t: any) => isTripInCategory(t, singleParam));

    // If category has exactly 1 trip, redirect directly to trip detail page
    if (categoryTrips.length === 1) {
      const singleTrip = categoryTrips[0];
      const destSlug = slugify(singleTrip.location || singleTrip.destination || singleParam);
      redirect(`/trips/${destSlug}/${singleTrip.seoSlug || singleTrip._id}`);
    }

    const initialCategories = catsRes?.data || [];
    const initialReviews = reviewsRes?.data || [];

    return (
      <CategorieDetails
        initialTrips={categoryTrips}
        initialCategories={initialCategories}
        initialAllTrips={allTrips}
        initialReviews={initialReviews}
      />
    );
  }

  // 2-segment trip detail page (/trips/bhutan/explore-bhutan-magic-7-day-tour)
  const targetSlug = slugArray[slugArray.length - 1];
  const decodedSlug = decodeURIComponent(targetSlug);

  const [tripsRes, reviewsRes] = await Promise.all([
    getTrips(),
    getReviews(),
  ]);

  const list = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
  const rawTrip = list.find((t: any) => t.seoSlug === decodedSlug) || list.find((t: any) => t._id === decodedSlug);

  if (!rawTrip) {
    redirect("/experiences");
  }

  const reviews = reviewsRes?.data || [];
  return <TripDetail initialRaw={rawTrip} initialReviews={reviews} />;
}
