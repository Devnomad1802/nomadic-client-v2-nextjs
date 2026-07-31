import React from "react";
import type { Metadata } from "next";
import Paymentsuccess from "@/Payment/Paymentsuccess";

export const metadata: Metadata = {
  title: "Payment Successful | Nomadic Townies",
  description: "Your booking is confirmed. Get ready for an amazing experience with Nomadic Townies.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <Paymentsuccess />;
}
