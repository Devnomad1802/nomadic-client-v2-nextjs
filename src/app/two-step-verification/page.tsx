import React from "react";
import type { Metadata } from "next";
import { TwoStepVerification } from "@/SmallComponents/TwoStepVerification";

export const metadata: Metadata = {
  title: "Two-Step Verification | Nomadic Townies",
  description: "Complete two-step verification to securely log in to your Nomadic Townies account.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <TwoStepVerification />;
}
