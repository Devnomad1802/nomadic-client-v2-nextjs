import React from "react";
import type { Metadata } from "next";
import ContactUs from "@/PageComponents/ContactUs";
import { getBanners } from "@/utils/serverFetch";

export const metadata: Metadata = {
  title: "Contact Us | Get in Touch with Nomadic Townies",
  description:
    "Have a question about our trips, hosts, or experiences? Reach out to the Nomadic Townies team. We're happy to help you plan your next transformative adventure.",
  alternates: {
    canonical: "https://www.nomadictownies.com/contact-us",
  },
  openGraph: {
    type: "website",
    url: "https://www.nomadictownies.com/contact-us",
    siteName: "Nomadic Townies",
    title: "Contact Us | Nomadic Townies",
    description:
      "Have a question about trips, hosts or experiences? Reach out to the Nomadic Townies team.",
  },
  twitter: {
    card: "summary",
    title: "Contact Us | Nomadic Townies",
    description: "Reach out to the Nomadic Townies team for queries about trips and experiences.",
  },
};

export default async function Page() {
  const bannersRes = await getBanners().catch(() => null);
  const activeBanner = (bannersRes?.data || [])[0] || {};

  return <ContactUs contactbg={activeBanner.contactUS} />;
}
