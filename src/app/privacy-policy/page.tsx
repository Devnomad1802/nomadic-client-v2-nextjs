import React from "react";
import type { Metadata } from "next";
import PrivacyPolicy from "@/PageComponents/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | Nomadic Townies",
  description:
    "Read the Nomadic Townies privacy policy to understand how we collect, use, and protect your personal data when you use our platform to book travel experiences.",
  alternates: {
    canonical: "https://www.nomadictownies.com/privacy-policy",
  },
  robots: "index, follow",
};

export default function Page() {
  return <PrivacyPolicy />;
}
