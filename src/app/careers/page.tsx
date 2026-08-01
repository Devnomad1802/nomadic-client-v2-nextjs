import React from "react";
import type { Metadata } from "next";
import Careers from "@/PageComponents/Careers";

export const metadata: Metadata = {
  title: "Careers | Join the Nomadic Townies Team",
  description:
    "Passionate about travel and community? Join the Nomadic Townies team and help us build India's leading curated marketplace for host-led travel experiences.",
  alternates: {
    canonical: "https://www.nomadictownies.com/careers",
  },
  openGraph: {
    type: "website",
    url: "https://www.nomadictownies.com/careers",
    siteName: "Nomadic Townies",
    title: "Careers | Join the Nomadic Townies Team",
    description:
      "Join the Nomadic Townies team and help us build India's leading curated marketplace for host-led travel experiences.",
  },
  twitter: {
    card: "summary",
    title: "Careers | Nomadic Townies",
    description:
      "Join the Nomadic Townies team and help build India's leading curated travel marketplace.",
  },
};

export default function Page() {
  return <Careers />;
}
