// Server Component — NO "use client". Renders a real, crawlable internal-link
// index in the raw HTML on every page. The listing grids (/experiences, /blog,
// /hosts) render their cards client-side, so trips, hosts and blogs had no
// server-rendered links anywhere — they showed up in GSC as "Discovered/Crawled
// – currently not indexed". This slim site-index band fixes that site-wide:
// every published trip, host, blog and category gets a server-rendered <a>,
// plus the primary hubs (/hosts, /become-a-host) that were previously orphaned.
//
// Visible (not hidden) so the links carry full weight. Degrades gracefully —
// each fetch already returns [] on failure, so the band never breaks the page.
import React from "react";
import { getTrips, getHosts, getBlogs, getCategories } from "@/utils/serverFetch";

const slugify = (s: unknown) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normHostSlug = (s: unknown) =>
  String(s || "")
    .replace(/^\/?hosts?\//i, "")
    .replace(/^\//, "")
    .toLowerCase()
    .trim();

type L = { href: string; label: string };

const CAP = 60; // safety cap per section if catalogue grows large

export default async function SeoFooterLinks() {
  const [tripsRes, hostsRes, blogsRes, catsRes] = await Promise.all([
    getTrips().catch(() => null),
    getHosts().catch(() => null),
    getBlogs().catch(() => null),
    getCategories().catch(() => null),
  ]);

  const trips: any[] = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
  const hosts: any[] = Array.isArray(hostsRes?.data) ? hostsRes.data : [];
  const blogs: any[] = Array.isArray(blogsRes?.data) ? blogsRes.data : [];
  const cats: any[] = Array.isArray(catsRes?.data) ? catsRes.data : [];

  const tripLinks: L[] = trips
    .map((t) => {
      const slug = t?.seoSlug || t?._id;
      if (!slug) return null;
      const dest = slugify(t?.location || t?.destination || "trips");
      return { href: `/trips/${dest}/${slug}`, label: t?.title || "Trip" };
    })
    .filter(Boolean)
    .slice(0, CAP) as L[];

  const hostLinks: L[] = hosts
    .map((h) => {
      const slug = normHostSlug(h?.seoSlug || h?._id);
      return slug ? { href: `/hosts/${slug}`, label: h?.hostName || h?.hostTitle || "Host" } : null;
    })
    .filter(Boolean)
    .slice(0, CAP) as L[];

  const blogLinks: L[] = blogs
    .map((b) => {
      const slug = b?.seoSlug || b?._id;
      return slug ? { href: `/blog/${slug}`, label: b?.title || "Story" } : null;
    })
    .filter(Boolean)
    .slice(0, CAP) as L[];

  const catLinks: L[] = cats
    .map((c) => {
      const name = c?.Category || c?.name || c?.categoryName;
      const slug = slugify(name);
      return slug ? { href: `/trips/${slug}`, label: name } : null;
    })
    .filter(Boolean)
    .slice(0, CAP) as L[];

  const hubs: L[] = [
    { href: "/experiences", label: "All Experiences" },
    { href: "/hosts", label: "Meet Our Hosts" },
    { href: "/blog", label: "Travel Stories" },
    { href: "/become-a-host", label: "Become a Host" },
    { href: "/about-us", label: "About Us" },
    { href: "/contact-us", label: "Contact" },
  ];

  const Col = ({ title, links }: { title: string; links: L[] }) =>
    links.length ? (
      <div style={{ minWidth: 150, flex: "1 1 160px" }}>
        <h2
          style={{
            margin: "0 0 10px",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: "#C9BEAE",
          }}
        >
          {title}
        </h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((l) => (
            <li key={l.href + l.label} style={{ margin: "0 0 6px" }}>
              <a
                href={l.href}
                style={{ fontSize: 13, lineHeight: 1.4, color: "#E9E2D6", textDecoration: "none" }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <nav
      aria-label="Site index"
      style={{ background: "#211B16", borderTop: "1px solid #3A312A", color: "#E9E2D6" }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px clamp(16px, 4vw, 48px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px 32px",
        }}
      >
        <Col title="Explore" links={hubs} />
        {catLinks.length ? <Col title="Destinations & Categories" links={catLinks} /> : null}
        {tripLinks.length ? <Col title="Experiences" links={tripLinks} /> : null}
        {hostLinks.length ? <Col title="Hosts" links={hostLinks} /> : null}
        {blogLinks.length ? <Col title="Stories" links={blogLinks} /> : null}
      </div>
    </nav>
  );
}
