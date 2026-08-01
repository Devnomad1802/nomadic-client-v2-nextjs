import React from "react";
import type { Metadata } from "next";
import CancellationAndRefund from "@/PageComponents/CancellationAndRefund";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Nomadic Townies",
  description:
    "Read the Nomadic Townies cancellation and refund policy. Understand how cancellations are processed, refund timelines, and trip rescheduling options for community trips and experiences.",
  alternates: {
    canonical: "https://www.nomadictownies.com/cancellation-and-refund",
  },
  robots: "index, follow",
};

export default function Page() {
  return <CancellationAndRefund />;
}
