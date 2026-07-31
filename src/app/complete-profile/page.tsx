import React from "react";
import type { Metadata } from "next";
import CompleteProfile from "@/PageComponents/CompleteProfile";

export const metadata: Metadata = {
  title: "Complete Your Profile | Nomadic Townies",
  description: "Finish setting up your Nomadic Townies traveller profile.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <CompleteProfile />;
}
