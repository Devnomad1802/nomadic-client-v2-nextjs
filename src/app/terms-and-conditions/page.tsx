import React from "react";
import type { Metadata } from "next";
import TermsAndConditions from "@/PageComponents/TermsAndConditions";

export const metadata: Metadata = {
  title: "Terms & Conditions | Nomadic Townies",
  description:
    "Read the Nomadic Townies terms and conditions governing use of our platform, booking of travel experiences, host relationships, and community trip policies.",
  alternates: {
    canonical: "https://www.nomadictownies.com/terms-and-conditions",
  },
  robots: "index, follow",
};

export default function Page() {
  return <TermsAndConditions />;
}
