import React from "react";
import Blogs from "@/PageComponents/Blogs";
import { getBlogs } from "@/utils/serverFetch";
import { Metadata } from "next";

const OG_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

type Props = {
  params: Promise<{ category: string }>;
};

const formatCatName = (slug: string) => {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = formatCatName(category);
  const title = `Category: ${name} | Nomadic Townies Blog`;
  const description = `Browse all travel stories, destination guides, and articles under ${name} on Nomadic Townies.`;
  const canonical = `https://www.nomadictownies.com/blog/category/${category}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Nomadic Townies",
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${name} Travel Stories` }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function Page({ params }: Props) {
  const { category } = await params;
  const blogsRes = await getBlogs();

  const rawBlogs = blogsRes?.data || [];
  const blogs = [...rawBlogs].sort(
    (a, b) => new Date(b?.Date || 0).getTime() - new Date(a?.Date || 0).getTime()
  );

  return <Blogs initialBlogs={blogs} initialCategory={category} />;
}
