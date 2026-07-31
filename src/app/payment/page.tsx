import React from "react";
import type { Metadata } from "next";
import Payment from "@/PageComponents/Payment";

export const metadata: Metadata = {
  title: "Secure Payment | Nomadic Townies",
  description: "Complete your booking payment securely with Nomadic Townies.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <Payment />;
}
