import React from "react";
import Blogs from "@/PageComponents/Blogs";
import { getBlogs } from "@/utils/serverFetch";
import { Metadata } from "next";

const OG_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

export const metadata: Metadata = {
  title: "Stories & Travel Blogs | Nomadic Townies",
  description:
    "Read travel stories, destination guides, and community adventure blogs from real hosts and travellers on Nomadic Townies. Get inspired for your next trip.",
  alternates: {
    canonical: "https://nomadictownies.com/blog",
  },
  openGraph: {
    type: "website",
    url: "https://nomadictownies.com/blog",
    siteName: "Nomadic Townies",
    title: "Stories & Travel Blogs | Nomadic Townies",
    description:
      "Read travel stories, destination guides, and adventure blogs from real hosts and travellers.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Nomadic Townies Travel Blogs" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stories & Travel Blogs | Nomadic Townies",
    description:
      "Read travel stories, destination guides, and adventure blogs from real hosts and travellers.",
    images: [OG_IMAGE],
  },
};

export default async function Page() {
  const blogsRes = await getBlogs();

  const rawBlogs = blogsRes?.data || [];
  // Sort blogs in server component to match client initial layout order
  const blogs = [...rawBlogs].sort(
    (a, b) => new Date(b?.Date || 0).getTime() - new Date(a?.Date || 0).getTime()
  );

  return <Blogs initialBlogs={blogs} />;
}
