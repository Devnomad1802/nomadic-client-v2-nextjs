import React from "react";
import type { Metadata } from "next";
import Profile from "@/PageComponents/Profile";

export const metadata: Metadata = {
  title: "My Profile | Nomadic Townies",
  description: "Manage your Nomadic Townies profile, bookings, and preferences.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <Profile />;
}
