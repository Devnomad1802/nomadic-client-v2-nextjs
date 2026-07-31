import React from "react";
import type { Metadata } from "next";
import TwoStepCode from "@/SmallComponents/TwoSteoCode";

export const metadata: Metadata = {
  title: "Two-Step Verification | Nomadic Townies",
  description: "Enter your two-step verification code to securely access your account.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <TwoStepCode />;
}
