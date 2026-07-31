import React from "react";
import type { Metadata } from "next";
import Emailvarification from "@/SmallComponents/Emailvarification";

export const metadata: Metadata = {
  title: "Email Verification | Nomadic Townies",
  description: "Verify your email address to activate your Nomadic Townies account.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <Emailvarification />;
}
