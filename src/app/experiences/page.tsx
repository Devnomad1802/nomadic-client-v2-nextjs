import React from "react";
import type { Metadata } from "next";
import AllPackagesV3 from "@/PageComponents/AllPackagesV3";
import { getBanners } from "@/utils/serverFetch";

const OG_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

export const metadata: Metadata = {
  title: "All Travel Experiences & Curated Trips | Nomadic Townies",
  description:
    "Browse all curated travel experiences on Nomadic Townies — community trips, backpacking adventures, trekking, wellness retreats, cultural immersions and more. Filter by category, destination or price.",
  alternates: {
    canonical: "https://nomadictownies.com/experiences",
  },
  openGraph: {
    type: "website",
    url: "https://nomadictownies.com/experiences",
    siteName: "Nomadic Townies",
    title: "All Travel Experiences & Curated Trips | Nomadic Townies",
    description:
      "Browse all curated travel experiences — community trips, trekking, wellness retreats, cultural immersions and more from verified hosts.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Nomadic Townies Experiences" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Travel Experiences | Nomadic Townies",
    description:
      "Browse community trips, trekking, retreats, cultural immersions and more from verified hosts.",
    images: [OG_IMAGE],
  },
};

export default async function Page() {
  const bannersRes = await getBanners().catch(() => null);
  const activeBanner = (bannersRes?.data || [])[0] || {};

  return <AllPackagesV3 allpkgbg={activeBanner.allPakeges} />;
}
