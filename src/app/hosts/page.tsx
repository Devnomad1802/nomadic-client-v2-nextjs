import React from "react";
import MeetHosts from "@/PageComponents/MeetHosts";
import { getHosts } from "@/utils/serverFetch";
import { Metadata } from "next";

const OG_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

export const metadata: Metadata = {
  title: "Meet Our Hosts | Verified Local Experience Hosts | Nomadic Townies",
  description:
    "Browse verified local hosts, community hosts and experience hosts on Nomadic Townies — a curated marketplace of host-led experiences. Every trip is hosted by a real, verified person or community.",
  alternates: {
    canonical: "https://nomadictownies.com/hosts",
  },
  openGraph: {
    type: "website",
    url: "https://nomadictownies.com/hosts",
    siteName: "Nomadic Townies",
    title: "Meet Our Hosts | Verified Local Experience Hosts | Nomadic Townies",
    description:
      "Discover real, verified hosts — adventure, wellness, backpacking and cultural experience hosts leading host-led experiences.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Nomadic Townies Verified Hosts" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet Our Hosts | Nomadic Townies",
    description:
      "Discover real, verified hosts — adventure, wellness, backpacking and cultural experience hosts.",
    images: [OG_IMAGE],
  },
};

export default async function Page() {
  const hostsRes = await getHosts();
  const hosts = hostsRes?.data || [];

  return <MeetHosts initialHosts={hosts} />;
}
