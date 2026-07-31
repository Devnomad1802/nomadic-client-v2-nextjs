"use client";

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBookmark } from "../../utils/useBookmark";
import { Helmet } from "react-helmet-async";
import "./catPage.css";
import Footer from "../Footer";
import { useGetAllCategoriesQuery } from "../../services/categoriesApis";
import { useGetTripsByCagtegoryMutation } from "../../services/categoriesApis";
import { useGetTripsQuery } from "../../services/TripApis";
import { useGetAllReviewsQuery } from "../../services/ReviewsApis";
import { matchTemplate } from "./categoryCards";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VerifiedIcon from "@mui/icons-material/Verified";
import { dateLabel } from "../../utils/tripVisibility";
import "./homeV3.css";

// ─── helpers ──────────────────────────────────────────────
const initial = (name) => (name ? name.trim()[0]?.toUpperCase() : "N");
const norm = (s) => (s || "").toLowerCase().trim();

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// trip.categories can be nested/double-encoded e.g. ['["INDIA"]']
const parseCats = (v) => {
  const out = [];
  const walk = (x) => {
    if (Array.isArray(x)) return x.forEach(walk);
    if (typeof x !== "string") return;
    const s = x.trim();
    if (/^\[.*\]$/.test(s)) { try { return walk(JSON.parse(s)); } catch { /* noop */ } }
    out.push(s.replace(/[[\]"]/g, "").trim());
  };
  walk(v);
  return out.filter(Boolean);
};

const normSlug = (s) => String(s || "").replace(/^\/?hosts?\//i, "").replace(/^\//, "").toLowerCase().trim();

const isTripForHost = (trip, param) => {
  if (!trip || !param) return false;
  const pSlug = slugify(param);
  const pNorm = norm(param);
  const pClean = normSlug(param);

  const tripHost = trip.host;
  if (!tripHost) return false;

  if (typeof tripHost === "string" || typeof tripHost === "number") {
    const hStr = `${tripHost}`;
    if (hStr === `${param}` || normSlug(hStr) === pClean || slugify(hStr) === pSlug) return true;
  }
  if (typeof tripHost === "object") {
    const hId = `${tripHost._id || tripHost.id || ""}`;
    const hSlug = normSlug(tripHost.seoSlug || tripHost.hostTitle || tripHost.hostName || "");
    if (hId && (hId === param || normSlug(hId) === pClean)) return true;
    if (hSlug && (hSlug === pClean || slugify(hSlug) === pSlug || norm(hSlug) === pNorm)) return true;
    if (tripHost.hostTitle && (slugify(tripHost.hostTitle) === pSlug || normSlug(tripHost.hostTitle) === pClean)) return true;
    if (tripHost.hostName && (slugify(tripHost.hostName) === pSlug || normSlug(tripHost.hostName) === pClean)) return true;
  }
  return false;
};

const isTripInCategory = (trip, param) => {
  if (!trip || !param) return false;
  if (isTripForHost(trip, param)) return true;
  const pSlug = slugify(param);
  const pNorm = norm(param);

  if (trip.location && (slugify(trip.location) === pSlug || norm(trip.location) === pNorm)) return true;
  if (trip.destination && (slugify(trip.destination) === pSlug || norm(trip.destination) === pNorm)) return true;
  const cats = parseCats(trip.categories);
  if (cats.some((c) => slugify(c) === pSlug || norm(c) === pNorm)) return true;
  if (trip.category && (slugify(trip.category) === pSlug || norm(trip.category) === pNorm)) return true;
  if (trip.categoryName && (slugify(trip.categoryName) === pSlug || norm(trip.categoryName) === pNorm)) return true;
  if (trip.title && slugify(trip.title).includes(pSlug)) return true;

  return false;
};

const inCategory = (trip, name) => isTripInCategory(trip, name);

const batchDates = (trip) => {
  let b = [];
  try { b = trip?.selectDate ? (typeof trip.selectDate === "string" ? JSON.parse(trip.selectDate) : trip.selectDate) : []; } catch { b = []; }
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return (Array.isArray(b) ? b : []).map((x) => x?.BatchDate && new Date(x.BatchDate)).filter((d) => d && !isNaN(d) && d >= now).sort((a, b2) => a - b2);
};
const nextBatch = (trip) => batchDates(trip)[0] || null;
const fmtDate = (d) => d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : null;
const fmtPrice = (p) => `₹${parseInt(p || 0, 10).toLocaleString("en-IN")}`;
const tripImg = (t) => t?.cardImage || t?.Banner_Image || t?.bannerImage || t?.image || "";
const ratingOf = (t) => { const r = Number(t?.ratings ?? t?.rating); return isNaN(r) || !r ? 4.8 : r; };

const StarSvg = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.8 6.6 20l1-6.1L3.2 9.5l6.1-.9L12 3Z" /></svg>);

const CategorieDetails = ({ initialTrips, initialCategories, initialAllTrips, initialReviews }) => {
  const navigate = useNavigate();
  const { isSaved, toggle } = useBookmark();
  const { slug } = useParams();
  const categoryParam = decodeURIComponent(slug || "");

  const { data: catRes } = useGetAllCategoriesQuery(undefined, { skip: !!initialCategories });
  const { data: allTripsRes } = useGetTripsQuery(undefined, { skip: !!initialAllTrips });
  const { data: revRes } = useGetAllReviewsQuery(undefined, { skip: !!initialReviews });
  const [GetTripsByCagtegory, { isLoading: mutationLoading }] = useGetTripsByCagtegoryMutation();
  const [trips, setTrips] = useState(initialTrips || []);
  const [sort, setSort] = useState("soonest");

  useEffect(() => {
    if (initialTrips && initialTrips.length > 0) {
      setTrips(initialTrips);
      return;
    }
    const all = initialAllTrips || (Array.isArray(allTripsRes?.data) ? allTripsRes.data : []);
    if (all.length > 0) {
      const filtered = all.filter((t) => isTripInCategory(t, categoryParam));
      setTrips(filtered);
    } else {
      let active = true;
      (async () => {
        try {
          const res = await GetTripsByCagtegory({ categories: categoryParam }).unwrap();
          if (active) setTrips(Array.isArray(res?.data) ? res.data : []);
        } catch {
          if (active) setTrips([]);
        }
      })();
      return () => { active = false; };
    }
  }, [GetTripsByCagtegory, categoryParam, initialTrips, initialAllTrips, allTripsRes]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [slug]);

  const isLoading = initialTrips ? false : mutationLoading;

  const cats = initialCategories || (Array.isArray(catRes?.data) ? catRes.data : []);
  const catDoc = useMemo(() => cats.find((c) => norm(c?.Category) === norm(categoryParam)), [cats, categoryParam]);
  const tpl = matchTemplate(catDoc?.Category || categoryParam);
  const displayName = tpl.name || catDoc?.Category || categoryParam;
  const heroImg = catDoc?.Page_Banner_Image || catDoc?.Banner_Image || "";
  const count = trips.length;

  const sortedTrips = useMemo(() => {
    const arr = [...trips];
    if (sort === "price-low") arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-high") arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else if (sort === "rating") arr.sort((a, b) => ratingOf(b) - ratingOf(a));
    else if (sort === "duration") arr.sort((a, b) => (Number(a.days) || 0) - (Number(b.days) || 0));
    return arr;
  }, [trips, sort]);

  useEffect(() => {
    if (!isLoading && sortedTrips.length === 1) {
      const singleTrip = sortedTrips[0];
      const destSlug = slugify(singleTrip.location || singleTrip.destination || categoryParam);
      navigate(`/trips/${destSlug}/${singleTrip.seoSlug || singleTrip._id}`, { replace: true });
    }
  }, [isLoading, sortedTrips, navigate, categoryParam]);

  // suggested categories that DO have trips (excluding current)
  const suggested = useMemo(() => {
    const allTrips = Array.isArray(allTripsRes?.data) ? allTripsRes.data : [];
    return cats
      .filter((c) => norm(c?.Category) !== norm(categoryParam))
      .map((c) => ({ name: matchTemplate(c?.Category).name || c?.Category, raw: c?.Category, n: allTrips.filter((t) => inCategory(t, c?.Category)).length }))
      .filter((c) => c.n > 0)
      .slice(0, 4);
  }, [cats, allTripsRes, categoryParam]);

  const reviews = (Array.isArray(revRes?.data) ? revRes.data : []).slice(0, 3);
  const stars = (n) => { const r = Math.max(0, Math.min(5, Math.round(Number(n) || 5))); return "★".repeat(r) + "☆".repeat(5 - r); };

  const seoTitle = `${displayName} Experiences & Community Trips | Nomadic Townies`;
  const seoDesc = `Discover curated ${displayName} experiences on Nomadic Townies — community trips, retreats, workshops and cultural immersions led by passionate hosts.`;

  return (
    <div className="catpg">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={`https://nomadictownies.com/category/${slug}`} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {heroImg && <meta property="og:image" content={heroImg} />}
      </Helmet>

      <div className="wrap">
        {/* breadcrumb */}
        <div className="crumb">
          <a onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</a>
          <span>›</span>
          <a onClick={() => navigate("/experiences")} style={{ cursor: "pointer" }}>All Experiences</a>
          <span>›</span>
          <span className="cur">{displayName}</span>
        </div>

        {/* hero */}
        <section className="cat-hero">
          <button className="back-btn" title="Back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          {heroImg && <img src={heroImg} alt={`${displayName} trips and tours by Nomadic Townies`} />}
          <div className="cat-hero-inner">
            <div>
              <div className="cat-hero-eyebrow">Explore by category</div>
              <h1>{displayName}</h1>
              <p className="blurb">{tpl.desc}</p>
            </div>
            <div className="cat-hero-count">
              <div className="num">{isLoading ? "…" : count}</div>
              <div className="lbl">Trips</div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="cat-loading">Loading trips…</div>
        ) : count > 0 ? (
          <>
            {/* toolbar */}
            <div className="toolbar">
              <div className="toolbar-title">Upcoming trips <span>· {count} available</span></div>
              <div className="sort-sel">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M6 12h12M10 18h4" /></svg>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="soonest">Soonest departure</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

            {/* trip grid with standard cards and bottom margin */}
            <div className="ntv3" style={{ marginTop: 24, marginBottom: 50 }}>
              <div className="trips-grid">
                {sortedTrips.map((trip) => {
                  const date = dateLabel(trip);
                  const verified = Boolean(trip?.host);
                  const destSlug = slugify(trip.location || trip.destination || "trip");
                  const tripUrl = `/trips/${destSlug}/${trip.seoSlug || trip._id}`;
                  return (
                    <a
                      key={trip._id}
                      onClick={() => {
                        navigate(tripUrl);
                        if (typeof window !== "undefined") window.scrollTo(0, 0);
                      }}
                      className="tc"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="tc-img">
                        {trip.cardImage || trip.Banner_Image ? (
                          <img
                            className="tc-img-inner"
                            src={trip.cardImage || trip.Banner_Image}
                            alt={trip.title}
                            loading="lazy"
                            onError={(e) => {
                              const p = e.currentTarget.parentElement;
                              if (p) p.style.background = "linear-gradient(135deg,#2c3e50,#4a6741)";
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="tc-img-inner" style={{ background: "linear-gradient(135deg,#2c3e50,#4a6741)" }} />
                        )}
                        <button
                          className={`tc-fav${isSaved(trip._id) ? " on" : ""}`}
                          aria-label={isSaved(trip._id) ? "Remove from saved" : "Save"}
                          aria-pressed={isSaved(trip._id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(trip._id, e);
                          }}
                        >
                          <FavoriteIcon sx={{ fontSize: 14 }} />
                        </button>
                        {trip.tripOff ? <span className="tc-off">{trip.tripOff}% OFF</span> : null}
                      </div>
                      <div className="tc-body">
                        <div className="tc-host">
                          <div className="tc-avatar">{initial(trip?.host?.hostName)}</div>
                          <span>Hosted by <b style={{ color: "var(--text-dark)" }}>{trip?.host?.hostName || "Nomadic Townies"}</b></span>
                          {verified && <span className="tc-verified"><VerifiedIcon sx={{ fontSize: 13 }} />Verified</span>}
                        </div>
                        <h3 className="tc-title">{trip.title}</h3>
                        <div className="tc-meta">
                          {trip.location && <span className="tc-meta-item"><PlaceOutlinedIcon sx={{ fontSize: 12 }} />{trip.location}</span>}
                          {(trip.nights || trip.days) && <span className="tc-meta-item"><AccessTimeIcon sx={{ fontSize: 12 }} />{trip.nights}N / {trip.days}D</span>}
                          {date && <span className="tc-meta-item"><CalendarTodayIcon sx={{ fontSize: 11 }} />{date}</span>}
                        </div>
                        <div className="tc-foot">
                          <div className="tc-price">
                            <b>₹{Number(trip.price || 0).toLocaleString("en-IN")}</b>
                            {trip.strikePrice ? <s>₹{Number(trip.strikePrice).toLocaleString("en-IN")}</s> : null}
                            <em>/ person</em>
                          </div>
                          <span className="btn btn-outline btn-sm">View</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* ═══ EMPTY STATE ═══ */
          <>
            <div className="empty">
              <svg className="empty-illus" viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="#CD482A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="80" cy="58" r="34" />
                  <circle cx="80" cy="58" r="4" fill="#CD482A" stroke="none" />
                  <polygon points="80,32 72,58 80,58" fill="#CD482A" stroke="none" />
                  <polygon points="80,84 88,58 80,58" fill="#E8C4B8" stroke="none" />
                </g>
                <text x="80" y="24" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="800" fill="#CD482A">N</text>
                <path d="M28 118 q30 -16 52 -4 q24 13 52 -6" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeDasharray="3,7" strokeLinecap="round" />
                <circle cx="28" cy="118" r="4" fill="#9CA3AF" />
                <path d="M132 108 q9 0 9 9 q0 8 -9 16 q-9 -8 -9 -16 q0 -9 9 -9Z" fill="none" stroke="#CD482A" strokeWidth="2.6" />
                <circle cx="132" cy="117" r="3" fill="#CD482A" />
              </svg>
              <h2>New {displayName} trips are on the way</h2>
              <p>We&apos;re a young platform and our hosts are busy planning the next batch of <b>{displayName}</b> adventures. Be the first to know when they go live.</p>
              <div className="empty-actions">
                <button className="btn btn-orange" onClick={() => navigate("/experiences")}>
                  Explore all trips
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
                <button className="btn btn-ghost" onClick={() => navigate("/contact-us")}>Talk to us</button>
              </div>
              <div className="notify">
                <h3>Get notified when trips open</h3>
                <p>No spam — just a heads-up the moment a new trip in this category is live.</p>
                <form className="notify-form" onSubmit={(e) => { e.preventDefault(); e.currentTarget.querySelector("button").textContent = "Added ✓"; }}>
                  <input type="email" placeholder="you@email.com" required />
                  <button type="submit">Notify me</button>
                </form>
              </div>
            </div>

            {suggested.length > 0 && (
              <div className="suggest">
                <div className="suggest-label">Meanwhile, explore these</div>
                <div className="suggest-row">
                  {suggested.map((s) => (
                    <a key={s.raw} className="suggest-chip" onClick={() => navigate(`/category/${s.raw}`)} style={{ cursor: "pointer" }}>
                      {s.name} <span className="c">{s.n}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {reviews.length > 0 && (
        <section className="reviews">
          <div className="wrap">
            <div className="reviews-head">
              <div className="kicker">Loved by travellers</div>
              <h2>What our community says</h2>
              <div className="reviews-summary">
                <span className="stars">★★★★★</span>
                <span><b>4.9</b> average from <b>120+</b> travellers</span>
              </div>
            </div>
            <div className="reviews-grid">
              {reviews.map((rev) => (
                <div className="review-card" key={rev._id}>
                  <div className="rc-stars">{stars(rev.rating)}</div>
                  <p className="rc-text">{rev.Review || rev.Title}</p>
                  <div className="rc-who">
                    <div className="rc-avatar">
                      {rev.Profile_Image ? <img src={rev.Profile_Image} alt={rev.Name} /> : (rev.Name || "?").trim()[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="rc-name">{rev.Name}</div>
                      <div className="rc-trip">{rev.Title || rev.Job}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default CategorieDetails;
