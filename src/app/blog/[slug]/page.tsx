import React from "react";
import { notFound } from "next/navigation";
import BlogDetail from "@/Component/BlogDetail";
import { getBlogs, getTrips } from "@/utils/serverFetch";
import { Metadata } from "next";

const SITE = "https://www.nomadictownies.com";
const slugify = (s: string) =>
  String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Match the trip this story is about: same seoSlug first, else a location/title
// overlap. Used for the "Book this experience" CTA + internal linking.
function findLinkedTrip(blog: any, trips: any[]) {
  if (!blog || !Array.isArray(trips)) return null;
  const bySlug = trips.find((t) => t.seoSlug && t.seoSlug === blog.seoSlug);
  if (bySlug) return bySlug;
  const loc = slugify(blog.location || "");
  if (!loc) return null;
  return (
    trips.find(
      (t) =>
        slugify(t.location || "") === loc ||
        slugify(t.destination || "") === loc ||
        slugify(t.title || "").includes(loc)
    ) || null
  );
}
function tripHref(t: any) {
  if (!t) return null;
  const dest = slugify(t.location || t.destination || "trip");
  return `${SITE}/trips/${dest}/${t.seoSlug || t._id}`;
}

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
  const pageUrl = `https://www.nomadictownies.com/blog/${activeSlug}`;
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
  const [blogsRes, tripsRes] = await Promise.all([getBlogs(), getTrips()]);
  const blogs = blogsRes?.data || [];
  const item = blogs.find((b: any) => b.seoSlug === slug || b._id === slug);

  // Return a real 404 (not a soft-404 at HTTP 200) for unknown slugs.
  if (!item) notFound();

  const trips = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
  const linkedTrip = findLinkedTrip(item, trips);
  const linkedTripUrl = tripHref(linkedTrip);

  const activeSlug = item.seoSlug || item._id;
  const pageUrl = `${SITE}/blog/${activeSlug}`;
  const description =
    item.metaDescription ||
    item.content1?.replace(/<[^>]+>/g, "").substring(0, 160) ||
    "Travel stories and community trips with Nomadic Townies.";

  // Server-rendered structured data (was client-only before, so it never
  // appeared in the crawlable HTML). BlogPosting + BreadcrumbList.
  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: item.title || "Travel Story",
    description,
    image: item.Banner_Image ? [item.Banner_Image] : [],
    datePublished: item.Date || undefined,
    dateModified: item.updatedAt || item.Date || undefined,
    author: { "@type": "Person", name: item.author || "Nomadic Townies" },
    publisher: {
      "@type": "Organization",
      name: "Nomadic Townies",
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: item.title || "Story", item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <BlogDetail initialBlog={item} initialAllBlogs={blogs} {...({ linkedTrip, linkedTripUrl } as any)} />
    </>
  );
}
