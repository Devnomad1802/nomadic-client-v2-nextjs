import React from "react";
import type { Metadata } from "next";
import Paymentfail from "@/Payment/PaymentFail";

export const metadata: Metadata = {
  title: "Payment Failed | Nomadic Townies",
  description: "Your payment could not be processed. Please try again.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <Paymentfail />;
}
