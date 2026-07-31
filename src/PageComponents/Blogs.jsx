"use client";

/* eslint-disable react/prop-types */
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./blogs.css";
import "../Component/Home/homeV3.css";
import Footer from "../Component/Footer";
import { useGetAllBlogsQuery } from "../services";

const PH = ["ph-1", "ph-2", "ph-3", "ph-4", "ph-5", "ph-6"];
const PER_PAGE = 6;

const initial = (s) => (`${s || "?"}`).trim().charAt(0).toUpperCase() || "?";
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
// Estimate read time from structured items / legacy content fields
const readMin = (b) => {
  if (!b) return 1;
  const parts = [
    b.title, b.subTitle, b.description, b.content, b.content1, b.content2, b.details, b.metaDescription,
    ...(Array.isArray(b.items) ? b.items.map((i) => i?.content || i?.text || i?.caption || "") : []),
    ...(Array.isArray(b.sections) ? b.sections.map((s) => s?.content || s?.title || "") : []),
  ];
  const cleanText = parts.filter(Boolean).join(" ").replace(/<[^>]+>/g, " ").replace(/&nbsp;| /g, " ");
  const words = cleanText.trim().split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
};

const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
const PinIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>);
const ArrowIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const Blogs = ({ initialBlogs, initialCategory = "" }) => {
  const navigate = useNavigate();
  const { category: catParam } = useParams();
  const [searchParams] = useSearchParams();

  const activeQuery = catParam || initialCategory || searchParams.get("category") || searchParams.get("location");

  const { data, isLoading: queryLoading } = useGetAllBlogsQuery(undefined, { skip: !!initialBlogs });

  const blogs = useMemo(() => {
    if (initialBlogs) return initialBlogs;
    const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    // newest first
    return [...list].sort((a, b) => new Date(b?.Date || 0) - new Date(a?.Date || 0));
  }, [data, initialBlogs]);

  const isLoading = initialBlogs ? false : queryLoading;

  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState(activeQuery || "all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoc(activeQuery || "all");
    if (typeof window !== "undefined" && window.location.pathname === "/blog" && window.location.search) {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("category") || sp.get("location");
      if (q) {
        window.history.replaceState({}, "", `/blog/category/${slugify(q)}`);
      }
    }
  }, [activeQuery]);

  const locations = useMemo(
    () => Array.from(new Set(blogs.map((b) => b?.location).filter(Boolean))),
    [blogs]
  );

  // distinct destinations + story counts (for the destination grid)
  const destinations = useMemo(() => {
    const map = new Map();
    blogs.forEach((b) => { if (b?.location) map.set(b.location, (map.get(b.location) || 0) + 1); });
    return Array.from(map, ([name, count]) => ({ name, count })).slice(0, 8);
  }, [blogs]);

  const displayCatName = useMemo(() => {
    if (!loc || loc === "all") return "";
    const matchedLoc = locations.find((l) => slugify(l) === slugify(loc));
    if (matchedLoc) return matchedLoc;
    return loc
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [loc, locations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      if (loc !== "all") {
        const target = slugify(loc);
        const matchesLoc = b?.location && slugify(b.location) === target;
        const matchesCat = (b?.category && slugify(b.category) === target) || (b?.categoryName && slugify(b.categoryName) === target);
        if (!matchesLoc && !matchesCat) return false;
      }
      if (q) {
        const hay = [b?.title, b?.location, b?.category, b?.author, b?.metaDescription].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [blogs, search, loc]);

  const active = search.trim() || loc !== "all";
  // Featured (1 big + 2 small) only when no filter/search active
  const featured = active ? [] : filtered.slice(0, 3);
  const rest = active ? filtered : filtered.slice(3);

  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = rest.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const go = (b) => { navigate(`/blog/${b?.seoSlug || b?._id}`); window.scrollTo(0, 0); };
  const onFilter = (l) => {
    setPage(1);
    if (l === "all") {
      navigate("/blog");
    } else {
      navigate(`/blog/category/${slugify(l)}`);
    }
  };
  const onSearch = (v) => { setSearch(v); setPage(1); };

  const StoryCard = (b, i) => (
    <Link key={b._id} to={`/blog/${b?.seoSlug || b?._id}`} className="blog-card" style={{ textDecoration: "none" }}>
      <div className="blog-img">
        {b?.Banner_Image ? (
          <img src={b.Banner_Image} alt={b?.title ? `${b.title} - Nomadic Townies Blog` : "Nomadic Townies blog"} loading="lazy" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a3a2a,#2d6b4a)" }} />
        )}
      </div>
      <div className="blog-body">
        <div className="blog-cat">{b?.location || b?.category || "Travel Story"}</div>
        <div className="blog-title">{b?.title}</div>
        <div className="blog-meta">
          <span style={{ color: "var(--text-lighter)" }}>{fmtDate(b?.Date)}</span>
          {b?.Date ? <span style={{ width: 3, height: 3, background: "var(--text-lighter)", borderRadius: "50%", display: "inline-block" }} /> : null}
          <span className="blog-readmore">Read more →</span>
        </div>
      </div>
    </Link>
  );

  const canonicalUrl = loc !== "all"
    ? `https://nomadictownies.com/blog/category/${slugify(loc)}`
    : "https://nomadictownies.com/blog";

  return (
    <div className="blogpg">
      <Helmet>
        <title>{displayCatName ? `Category: ${displayCatName} | Nomadic Townies Blog` : "Travel Blogs & Destination Guides | Nomadic Townies"}</title>
        <meta name="description" content={displayCatName ? `Explore travel stories and guides under ${displayCatName} by Nomadic Townies.` : "Explore travel blogs, destination guides, trip itineraries & travel tips by Nomadic Townies. Get inspired for your next adventure in India & beyond."} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={displayCatName ? `Category: ${displayCatName} | Nomadic Townies Blog` : "Travel Blogs & Destination Guides | Nomadic Townies"} />
        <meta property="og:description" content="Explore travel blogs, destination guides, trip itineraries &amp; travel tips by Nomadic Townies." />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      {/* HERO */}
      <header className="editorial-hero">
        <div className="wrap">
          {loc !== "all" ? (
            <>
              <div className="kicker" style={{ cursor: "pointer" }} onClick={() => navigate("/blog")}>
                Home › Blog › {displayCatName}
              </div>
              <h1>Category: {displayCatName}</h1>
              <p className="lede">Field notes, travel guides, and stories under {displayCatName}.</p>
            </>
          ) : (
            <>
              <div className="kicker">The Nomadic Journal</div>
              <h1>Stories from the road, written by the people who walk it.</h1>
              <p className="lede">Field notes, destination guides, and slow-travel essays from the hosts and travellers who make Nomadic Townies what it is.</p>
            </>
          )}

          <div className="toolbar">
            <div className="search-box">
              <SearchIcon />
              <input type="text" placeholder="Search stories, places, or authors…" value={search} onChange={(e) => onSearch(e.target.value)} />
            </div>
            <div className="filter-chips">
              <button className={`chip${loc === "all" ? " on" : ""}`} onClick={() => onFilter("all")}>All</button>
              {locations.map((l) => (
                <button key={l} className={`chip${slugify(loc) === slugify(l) ? " on" : ""}`} onClick={() => onFilter(l)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="loading">Loading stories…</div>
      ) : (
        <>
          {/* FEATURED */}
          {featured.length > 0 && (
            <section className="section">
              <div className="wrap">
                <div className="section-head">
                  <div>
                    <h2 className="section-h">The latest</h2>
                    <p className="section-sub">Hot off the trail — fresh stories from our hosts and community.</p>
                  </div>
                </div>
                <div className="featured-grid">
                  {/* big */}
                  {(() => {
                    const b = featured[0];
                    return (
                      <a className="big-card" onClick={() => go(b)}>
                        {b?.Banner_Image ? <img className="img" src={b.Banner_Image} alt={b?.title || ""} /> : <div className="img ph ph-1" />}
                        <div className="overlay" />
                        <div className="meta-row">
                          {b?.location && <span className="story-cat"><PinIcon />{b.location}</span>}
                          <h3 className="story-title">{b?.title}</h3>
                          {b?.metaDescription && <p className="story-excerpt">{b.metaDescription}</p>}
                          <div className="byline">
                            <div className="byline-avatar">{initial(b?.author)}</div>
                            <span>{b?.author || "Nomadic Townies"}</span>
                            <span className="byline-dot" />
                            <span>{fmtDate(b?.Date)}</span>
                            <span className="byline-dot" />
                            <span>{readMin(b)} min read</span>
                          </div>
                        </div>
                      </a>
                    );
                  })()}
                  {/* 2 small */}
                  <div className="small-cards-col">
                    {featured.slice(1, 3).map((b, i) => (
                      <a key={b._id} className="small-card" onClick={() => go(b)}>
                        {b?.Banner_Image ? <img className="img" src={b.Banner_Image} alt={b?.title || ""} /> : <div className={`img ph ${PH[(i + 1) % PH.length]}`} />}
                        <div className="overlay" />
                        <div className="meta-row">
                          {b?.location && <span className="story-cat">{b.location}</span>}
                          <h3 className="story-title">{b?.title}</h3>
                          <div className="byline">
                            <div className="byline-avatar">{initial(b?.author)}</div>
                            <span>{b?.author || "Nomadic Townies"}</span>
                            <span className="byline-dot" />
                            <span>{readMin(b)} min read</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* LATEST / FILTERED GRID */}
          <section className="section" style={{ paddingTop: featured.length > 0 ? 0 : undefined }}>
            <div className="wrap">
              <div className="section-head">
                <div>
                  <h2 className="section-h">{active ? "Results" : "More from the journal"}</h2>
                  <p className="section-sub">{active ? `${rest.length} stor${rest.length === 1 ? "y" : "ies"} found` : "Field notes, guides, and travel essays."}</p>
                </div>
              </div>

              {pageItems.length > 0 ? (
                <div className="ntv3">
                  <div className="blog-grid">
                    {pageItems.map((b, i) => StoryCard(b, i))}
                  </div>
                </div>
              ) : (
                <div className="empty">{active ? "No stories match — try clearing the search or filters." : "More stories coming soon."}</div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="pg arrow" disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m15 6-6 6 6 6" /></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} className={`pg${n === safePage ? " on" : ""}`} onClick={() => { setPage(n); window.scrollTo(0, 0); }}>{n}</button>
                  ))}
                  <button className="pg arrow" disabled={safePage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* BY DESTINATION */}
          {destinations.length > 0 && (
            <section className="destinations-section">
              <div className="wrap">
                <div className="section-head">
                  <div>
                    <h2 className="section-h">Browse by destination</h2>
                    <p className="section-sub">Find stories from the places you want to wake up next.</p>
                  </div>
                </div>
                <div className="dest-grid">
                  {destinations.map((d, i) => {
                    const cover = blogs.find((b) => b?.location === d.name && b?.Banner_Image)?.Banner_Image;
                    return (
                      <a key={d.name} className="dest-card" onClick={() => onFilter(d.name)}>
                        {cover ? <img src={cover} alt={d.name} loading="lazy" /> : <div className={`ph ${PH[i % PH.length]}`} />}
                        <div className="overlay" />
                        <div className="info">
                          <div className="name">{d.name}</div>
                          <div className="count">{d.count} stor{d.count === 1 ? "y" : "ies"}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* NEWSLETTER */}
          <section className="section">
            <div className="wrap">
              <div className="newsletter">
                <div className="newsletter-text">
                  <h2>Stories in your inbox. No filler.</h2>
                  <p>One email a month — a long-read essay, a hand-picked trip, and the corners of India we&apos;re falling in love with right now.</p>
                </div>
                <div>
                  <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); e.currentTarget.reset(); }}>
                    <input type="email" placeholder="your@email.com" required />
                    <button type="submit">Join the journal</button>
                  </form>
                  <div className="newsletter-note">No spam. Unsubscribe anytime.</div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Blogs;
