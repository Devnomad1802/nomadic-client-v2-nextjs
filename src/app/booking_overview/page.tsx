import React from "react";
import type { Metadata } from "next";
import BookingOverview from "@/Payment/BookingOverview";

export const metadata: Metadata = {
  title: "Booking Overview | Nomadic Townies",
  description: "Review your trip booking details before confirming payment.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <BookingOverview />;
}
