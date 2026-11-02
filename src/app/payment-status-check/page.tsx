import React from "react";
import type { Metadata } from "next";
import PaymentStatusCheck from "@/Payment/PaymentStatusCheck";

export const metadata: Metadata = {
  title: "Verifying Payment | Nomadic Townies",
  description: "We're confirming your payment.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <PaymentStatusCheck />;
}
