import React from "react";
import HostPage from "@/Component/Host/HostPage";
import { getHostById, getHostTrips, getHostReviews, getHosts } from "@/utils/serverFetch";
import { Metadata } from "next";

const FALLBACK_IMAGE =
  "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg";

type Props = {
  params: Promise<{ slug: string[] | string }>;
};

const normSlug = (s: string) =>
  String(s || "")
    .replace(/^\/?hosts?\//i, "")
    .replace(/^\//, "")
    .toLowerCase()
    .trim();

// Helper to find host _id by slug array/string or id
async function resolveHostId(slugParam: string[] | string): Promise<string> {
  const raw = Array.isArray(slugParam) ? slugParam.join("/") : slugParam;
  const target = normSlug(raw);
  const hostsRes = await getHosts();
  const hosts = hostsRes?.data || hostsRes || [];
  const found = hosts.find((h: any) => {
    if (!h) return false;
    const hSlug = normSlug(h.seoSlug || "");
    const hId = String(h._id || h.id || "").toLowerCase().trim();
    return hSlug === target || hId === target || h._id === raw || h.seoSlug === raw;
  });
  return found?._id || target;
}

// Generate dynamic metadata for the host profile page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rawSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const hostId = await resolveHostId(slug);
  const hostRes = await getHostById(hostId);
  const host = hostRes?.data || hostRes || {};
  const name = host?.hostTitle || host?.hostName || "Verified Host";
  const activeSlug = normSlug(host?.seoSlug || host?._id || rawSlug);
  const pageUrl = `https://www.nomadictownies.com/hosts/${activeSlug}`;
  const ogImage = host?.coverImage || host?.brandingLogo || FALLBACK_IMAGE;
  const description =
    host?.aboutMe ||
    `Meet ${name}, a verified local host and guide curating community travel experiences on Nomadic Townies.`;

  return {
    title: `${name} - Community Host | Nomadic Townies`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "profile",
      url: pageUrl,
      siteName: "Nomadic Townies",
      title: `${name} - Community Host | Nomadic Townies`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${name} — Nomadic Townies Host` }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - Community Host | Nomadic Townies`,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const hostId = await resolveHostId(slug);
  const [hostRes, tripsRes, reviewsRes, allHostsRes] = await Promise.all([
    getHostById(hostId),
    getHostTrips(hostId),
    getHostReviews(hostId),
    getHosts(),
  ]);

  const host = hostRes?.data || hostRes || {};
  const trips = tripsRes?.data || tripsRes || [];
  const reviews = reviewsRes?.data ?? reviewsRes?.reviews ?? reviewsRes ?? [];
  const allHosts = allHostsRes?.data || allHostsRes || [];

  return (
    <HostPage
      initialHost={host}
      initialTrips={trips}
      initialReviews={reviews}
      initialAllHosts={allHosts}
    />
  );
}
