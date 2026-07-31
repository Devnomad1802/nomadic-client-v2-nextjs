import React from "react";
import BlogDetail from "@/Component/BlogDetail";
import { getBlogs } from "@/utils/serverFetch";
import { Metadata } from "next";

const FALLBACK_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate metadata dynamically on the server
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blogsRes = await getBlogs();
  const blogs = blogsRes?.data || [];
  const item = blogs.find((b: any) => b.seoSlug === slug || b._id === slug);

  if (!item) {
    return {
      title: "Story Not Found | Nomadic Townies",
      description: "This travel story could not be found.",
      robots: "noindex",
    };
  }

  const activeSlug = item.seoSlug || item._id;
  const pageUrl = `https://nomadictownies.com/blog/Details/${activeSlug}`;
  const ogImage = item.Banner_Image || FALLBACK_IMAGE;
  const description =
    item.metaDescription ||
    item.content1?.replace(/<[^>]+>/g, "").substring(0, 160) ||
    "Read about travel experiences and community trips with Nomadic Townies.";

  return {
    title: `${item.title || "Travel Story"} | Nomadic Townies`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "article",
      url: pageUrl,
      siteName: "Nomadic Townies",
      title: `${item.title || "Travel Story"} | Nomadic Townies`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: item.title || "Nomadic Townies Blog" }],
      locale: "en_IN",
      publishedTime: item.Date,
      authors: item.author ? [item.author] : ["Nomadic Townies"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title || "Travel Story"} | Nomadic Townies`,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const blogsRes = await getBlogs();
  const blogs = blogsRes?.data || [];
  const item = blogs.find((b: any) => b.seoSlug === slug || b._id === slug);

  return <BlogDetail initialBlog={item} initialAllBlogs={blogs} />;
}
