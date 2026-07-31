import React from "react";
import type { Metadata } from "next";
import ResetPassword from "@/Modals/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password | Nomadic Townies",
  description: "Set a new password to regain access to your Nomadic Townies account.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <ResetPassword />;
}
