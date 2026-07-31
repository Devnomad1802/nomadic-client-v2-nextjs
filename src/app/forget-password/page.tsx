import React from "react";
import type { Metadata } from "next";
import ForgetPassword from "@/Modals/ForgetPassword";

export const metadata: Metadata = {
  title: "Forgot Password | Nomadic Townies",
  description: "Reset your Nomadic Townies account password.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <ForgetPassword />;
}
