import React from "react";
import type { Metadata } from "next";
import BecomeAHost from "@/PageComponents/BecomeAHost";

const OG_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

export const metadata: Metadata = {
  title: "Become a Host | How It Works | Nomadic Townies",
  description:
    "Learn how to become a host on Nomadic Townies — apply, complete your profile, get approved and start hosting host-led experiences for curious travellers.",
  alternates: { canonical: "https://www.nomadictownies.com/become-a-host" },
  openGraph: {
    type: "website",
    url: "https://www.nomadictownies.com/become-a-host",
    siteName: "Nomadic Townies",
    title: "Become a Host | Nomadic Townies",
    description:
      "Share your expertise and stories. Apply to host curated, host-led experiences on Nomadic Townies.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Become a Nomadic Townies host" }],
    locale: "en_IN",
  },
};

export default function Page() {
  return <BecomeAHost />;
}
