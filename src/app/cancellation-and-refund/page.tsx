import React from "react";
import type { Metadata } from "next";
import CancellationAndRefund from "@/PageComponents/CancellationAndRefund";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Nomadic Townies",
  description:
    "The Nomadic Townies cancellation and refund policy — how cancellations are processed, refund timelines and trip rescheduling for community trips and experiences.",
  alternates: {
    canonical: "https://www.nomadictownies.com/cancellation-and-refund",
  },
  robots: "index, follow",
};

export default function Page() {
  return <CancellationAndRefund />;
}
