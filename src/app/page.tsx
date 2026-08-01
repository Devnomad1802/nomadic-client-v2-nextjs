import React from "react";
import type { Metadata } from "next";
import HomeV3 from "@/PageComponents/HomeV3";
import { getBanners, getTrips, getBlogs, getCategories } from "@/utils/serverFetch";

const OG_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

export const metadata: Metadata = {
  title: "Curated Travel Experiences, Community Trips & Retreats | Nomadic Townies",
  description:
    "Discover community trips, backpacking adventures, wellness retreats, workshops, and cultural immersions hosted by passionate local communities. Nomadic Townies is India's curated marketplace for transformative host-led travel experiences.",
  keywords:
    "curated travel experiences, community trips India, backpacking adventures, wellness retreats, cultural immersions, travel workshops, host-led experiences, meaningful travel, Nomadic Townies",
  alternates: {
    canonical: "https://www.nomadictownies.com/",
  },
  openGraph: {
    type: "website",
    url: "https://www.nomadictownies.com/",
    siteName: "Nomadic Townies",
    title: "Nomadic Townies | Curated Travel Experiences & Community Trips",
    description:
      "Explore meaningful travel experiences hosted by passionate communities — from backpacking adventures and retreats to workshops and cultural immersions across India.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Nomadic Townies — Host-led Travel Experiences" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomadic Townies | Curated Travel Experiences",
    description:
      "Discover host-led community trips, retreats, workshops, and cultural immersions through Nomadic Townies.",
    images: [OG_IMAGE],
  },
};

export default async function HomePage() {
  // Fetch all home page data on the server so Google indexes the full content
  const [bannersRes, tripsRes, blogsRes, catsRes] = await Promise.all([
    getBanners().catch(() => null),
    getTrips().catch(() => null),
    getBlogs().catch(() => null),
    getCategories().catch(() => null),
  ]);

  const activeBanner = (bannersRes?.data || [])[0] || {};
  const initialTrips = tripsRes?.data || [];
  const initialBlogs = (blogsRes?.data || []).sort(
    (a: any, b: any) => new Date(b?.Date || 0).getTime() - new Date(a?.Date || 0).getTime()
  );
  const initialCategories = catsRes?.data || [];

  return (
    <HomeV3
      homebg={activeBanner.home}
      toggle={activeBanner.toggle}
      homeVideo={activeBanner.homeVideo}
      categorySectionTitle={activeBanner.categorySectionTitle}
      categorySectionSubtitle={activeBanner.categorySectionSubtitle}
      initialTrips={initialTrips}
      initialBlogs={initialBlogs}
      initialCategories={initialCategories}
    />
  );
}
