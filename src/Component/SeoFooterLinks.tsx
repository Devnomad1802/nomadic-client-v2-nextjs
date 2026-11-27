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

// Module-level so it isn't recreated on every render.
function Col({ title, links }: { title: string; links: L[] }) {
  if (!links.length) return null;
  return (
    <div className="nt-si-col">
      <h2 className="nt-si-h">{title}</h2>
      <ul className="nt-si-list">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <a href={l.href} className="nt-si-link">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

  return (
    <nav aria-label="Site index" className="nt-siteindex">
      {/* Scoped, SSR-safe styles: left-aligned CSS Grid, consistent type scale,
          visible hover/focus, responsive columns, reduced-motion aware. All links
          stay in the server-rendered markup (SEO). */}
      <style>{`
        .nt-siteindex { background:#211B16; border-top:1px solid #3A312A; color:#E9E2D6; }
        .nt-siteindex .nt-si-wrap {
          max-width:1280px; margin:0 auto; padding:44px clamp(16px,4vw,48px);
          display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
          align-items:start; gap:32px; text-align:left;
        }
        .nt-siteindex .nt-si-col { min-width:0; }
        .nt-siteindex h2.nt-si-h {
          margin:0 0 14px; font-size:14px; font-weight:600; line-height:1.3;
          letter-spacing:.05em; text-transform:uppercase; color:#C9BEAE;
        }
        .nt-siteindex ul.nt-si-list {
          list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px;
        }
        .nt-siteindex a.nt-si-link {
          display:inline-block; font-size:13.5px; line-height:1.45; color:#D8CFC0;
          text-decoration:none; transition:color .15s ease; max-width:34ch;
        }
        .nt-siteindex a.nt-si-link:hover { color:#fff; }
        .nt-siteindex a.nt-si-link:focus-visible {
          outline:2px solid #C9BEAE; outline-offset:3px; border-radius:2px; color:#fff;
        }
        @media (prefers-reduced-motion: reduce) { .nt-siteindex a.nt-si-link { transition:none; } }
        @media (max-width:600px) {
          .nt-siteindex .nt-si-wrap { grid-template-columns:repeat(2, 1fr); gap:26px 20px; padding:32px 16px; }
          .nt-siteindex a.nt-si-link { padding:3px 0; } /* larger tap target on touch */
        }
      `}</style>
      <div className="nt-si-wrap">
        <Col title="Explore" links={hubs} />
        {catLinks.length ? <Col title="Destinations & Categories" links={catLinks} /> : null}
        {tripLinks.length ? <Col title="Experiences" links={tripLinks} /> : null}
        {hostLinks.length ? <Col title="Hosts" links={hostLinks} /> : null}
        {blogLinks.length ? <Col title="Stories" links={blogLinks} /> : null}
      </div>
    </nav>
  );
}
