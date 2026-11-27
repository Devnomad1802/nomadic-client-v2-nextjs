import React from "react";
import type { Metadata } from "next";
import MessagesInbox from "@/PageComponents/MessagesInbox";

export const metadata: Metadata = {
  title: "Messages | Nomadic Townies",
  description: "Your conversations with Nomadic Townies hosts.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <MessagesInbox />;
}
