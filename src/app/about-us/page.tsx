import React from "react";
import type { Metadata } from "next";
import AboutUs from "@/PageComponents/AboutUs";
import { getBanners } from "@/utils/serverFetch";

const OG_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

export const metadata: Metadata = {
  title: "About Us — Who We Are & Our Mission | Nomadic Townies",
  description:
    "Nomadic Townies is a curated marketplace for transformative, host-led travel experiences. We connect passionate communities and local hosts with mindful travellers seeking real, meaningful adventures across India.",
  alternates: {
    canonical: "https://www.nomadictownies.com/about-us",
  },
  openGraph: {
    type: "website",
    url: "https://www.nomadictownies.com/about-us",
    siteName: "Nomadic Townies",
    title: "About Nomadic Townies — Our Story & Mission",
    description:
      "We connect passionate communities and local hosts with mindful travellers seeking real, meaningful adventures. Discover who we are and why we travel differently.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "About Nomadic Townies" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Nomadic Townies — Our Story & Mission",
    description:
      "We connect passionate communities and local hosts with mindful travellers seeking real, meaningful adventures.",
    images: [OG_IMAGE],
  },
};

export default async function Page() {
  const bannersRes = await getBanners().catch(() => null);
  const activeBanner = (bannersRes?.data || [])[0] || {};

  return <AboutUs aboutbg={activeBanner.aboutUs} />;
}
