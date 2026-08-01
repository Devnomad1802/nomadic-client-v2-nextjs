"use client";

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../Component/Home/homeV3.css";
import "../Component/AllPackegs/apv3.css";

import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { useGetTripsQuery, useGetAllReviewsQuery, useGetTrendingTripsQuery } from "../services";
import { useGetAllCategoriesQuery } from "../services/categoriesApis";
import { TripCardSkeleton } from "../SmallComponents/Skeletons";
import CategoriesV3 from "../Component/Home/CategoriesV3";
import { listableTrips, nextDate, tripMonths, dateLabel } from "../utils/tripVisibility";
import { useBookmark } from "../utils/useBookmark";
import Footer from "../Component/Footer";
import EnquirNow from "../Modals/EnquirNow";

const parseCats = (c) => {
  if (Array.isArray(c)) return c.flatMap(parseCats);
  if (typeof c === "string") {
    const s = c.trim();
    if (s.startsWith("[")) { try { const p = JSON.parse(s); return Array.isArray(p) ? p.map((x)=>`${x}`.trim()) : [s]; } catch { return [s.replace(/[[\]"]/g,"").trim()]; } }
    return s ? [s] : [];
  }
  return [];
};
const DATE_OPTS = { day: "2-digit", month: "short", year: "numeric" };
const initial = (n) => (n ? n.trim()[0]?.toUpperCase() : "N");
const avgRating = (t) => {
  const r = t?.ratings ?? t?.rating;
  if (Array.isArray(r) && r.length) { const n = r.map(Number).filter((x)=>!isNaN(x)); return n.length ? (n.reduce((a,b)=>a+b,0)/n.length) : 4.8; }
  const num = Number(r); return isNaN(num) || !num ? 4.8 : num;
};

const stats = [
  { icon: <VerifiedUserOutlinedIcon sx={{fontSize:20}} />, num: "Verified", label: "Hand-picked hosts" },
  { icon: <GroupsOutlinedIcon sx={{fontSize:20}} />, num: "Curated", label: "Experiences" },
  { icon: <LockOutlinedIcon sx={{fontSize:20}} />, num: "100%", label: "Secure booking" },
  { icon: <SupportAgentOutlinedIcon sx={{fontSize:20}} />, num: "24/7", label: "Expert support" },
];

const AllPackagesV3 = ({ allpkgbg }) => {
  const navigate = useNavigate();
  const { isSaved, toggle } = useBookmark();
  const [searchParams] = useSearchParams();
  const { data: tripsRes, isLoading } = useGetTripsQuery();
  const { data: catRes } = useGetAllCategoriesQuery();
  const { data: trendRes } = useGetTrendingTripsQuery();
  const { data: revRes } = useGetAllReviewsQuery();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [draft, setDraft] = useState(searchParams.get("q") || "");
  const [cat, setCat] = useState("All");
  const [month, setMonth] = useState("All");
  const [sort, setSort] = useState("upcoming");
  const [opene, setOpene] = useState(false);
  const toggelModele = () => setOpene(!opene);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const catNames = useMemo(() => (Array.isArray(catRes?.data) ? catRes.data.map((c)=>c?.Category?.trim()).filter(Boolean) : []), [catRes]);

  // Central listing rules: future-dated batch trips + customized (flexible)
  // trips, soonest first — shared with the homepage so nothing is hidden.
  const upcoming = useMemo(() => listableTrips(tripsRes?.data), [tripsRes]);

  const months = useMemo(() => {
    const seen = [];
    upcoming.forEach((t)=>tripMonths(t).forEach((m)=>{ if(!seen.includes(m)) seen.push(m); }));
    return ["All", ...seen];
  }, [upcoming]);

  const trips = useMemo(() => {
    let list = upcoming;
    if (cat !== "All") list = list.filter((t)=>parseCats(t.categories).some((c)=>c.trim().toLowerCase()===cat.trim().toLowerCase()));
    if (month !== "All") list = list.filter((t)=>tripMonths(t).includes(month));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((t)=>[t.title,t.location,...parseCats(t.categories)].filter(Boolean).some((s)=>`${s}`.toLowerCase().includes(q)));
    const arr = [...list];
    if (sort === "price-asc") arr.sort((a,b)=>(Number(a.price)||0)-(Number(b.price)||0));
    else if (sort === "price-desc") arr.sort((a,b)=>(Number(b.price)||0)-(Number(a.price)||0));
    else if (sort === "rating") arr.sort((a,b)=>avgRating(b)-avgRating(a));
    else arr.sort((a,b)=>((nextDate(a)?.getTime()??Infinity)-(nextDate(b)?.getTime()??Infinity)));
    return arr;
  }, [upcoming, cat, month, search, sort]);

  const trending = useMemo(() => (Array.isArray(trendRes?.data) ? trendRes.data : []).slice(0, 10), [trendRes]);
  const reviews = useMemo(() => (Array.isArray(revRes?.data) ? revRes.data : []).slice(0, 9), [revRes]);

  const quick = ["All","Trekking","Wellness","International","Festivals","Backpacking"];
  const runSearch = () => setSearch(draft);

  return (
    <div className="ntv3 apv3">
      <Helmet>
        <title>All Travel Experiences | Community Trips &amp; Retreats | Nomadic Townies</title>
        <meta name="description" content="Browse all Nomadic Townies experiences — community trips, backpacking adventures, wellness retreats, workshops and cultural immersions. Filter by category and month, hosted by passionate communities." />
        <link rel="canonical" href="https://nomadictownies.com/experiences" />
        <meta property="og:title" content="All Travel Experiences | Nomadic Townies" />
        <meta property="og:description" content="Curated community trips, backpacking adventures, retreats, workshops and cultural immersions — hosted by passionate communities." />
        <meta property="og:url" content="https://nomadictownies.com/experiences" />
      </Helmet>

      <EnquirNow opene={opene} setOpene={setOpene} toggelModele={toggelModele} />

      {/* hero + search */}
      <section className="ap-hero">
        {allpkgbg ? <img className="ap-hero-bg" src={allpkgbg} alt="Nomadic Townies experiences" /> : null}
        <div className="ap-hero-overlay" />
        <div className="wrap" style={{ position: "relative", zIndex: 3 }}>
          <h1 className="ap-hero-h1">Find your next<br />great adventure.</h1>
          <p className="ap-hero-sub">Community trips, treks, wellness retreats, cultural immersions and more — handpicked and host-verified.</p>
          <div className="ap-search">
            <SearchIcon sx={{ ml: "18px", color: "#71717A", flexShrink: 0 }} />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search destination, experience type..."
            />
            <button onClick={runSearch}><SearchIcon sx={{ fontSize: 16 }} /> Search</button>
          </div>
          <div className="ap-quick">
            {quick.map((q) => (
              <div
                key={q}
                className={`ap-chip${(q === "All" ? !search : search.toLowerCase() === q.toLowerCase()) ? " on" : ""}`}
                onClick={() => { const v = q === "All" ? "" : q; setSearch(v); setDraft(v); }}
              >
                {q}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* stats bar */}
      <div className="ap-stats">
        <div className="wrap">
          <div className="ap-stats-inner">
            {stats.map((s, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div className="ap-stat">
                  <div className="ap-stat-icon">{s.icon}</div>
                  <div><div className="ap-stat-num">{s.num}</div><div className="ap-stat-label">{s.label}</div></div>
                </div>
                {i < stats.length - 1 && <div className="ap-stat-div" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* sticky filter bar */}
      <div className="ap-filter">
        <div className="wrap">
          {/* Row 1: Category Chips */}
          <div className="chips-row" style={{ marginBottom: 12 }}>
            {["All", ...catNames].map((c) => (
              <button key={c} className={`chip${cat === c ? " on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {/* Row 2: Left: Showing trips & Sort dropdown | Right: Month chips */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px 24px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="ap-result">Showing {trips.length} {trips.length === 1 ? "trip" : "trips"}</span>
              <select className="ap-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="upcoming">Upcoming first</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>

            {months.length > 1 && (
              <div className="chips-row" style={{ marginBottom: 0, flexWrap: "nowrap" }}>
                {months.map((m) => (
                  <button key={m} className={`chip${month === m ? " on" : ""}`} onClick={() => setMonth(m)}>{m === "All" ? "All months" : m}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* trips grid */}
      <section className="section">
        <div className="wrap">
          <div style={{ marginBottom: 28 }}>
            <div className="section-label"><span className="section-label-bar" />Hand-picked &amp; host-verified</div>
            <h2 className="section-h">Upcoming Trips</h2>
            <p className="section-sub">Browse, filter by month and book your spot before it fills up.</p>
          </div>

          {isLoading ? (
            <TripCardSkeleton count={8} />
          ) : trips.length === 0 ? (
            <div className="ap-empty">
              <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text-dark)" }}>No trips match your filters.</p>
              <p style={{ marginTop: 6 }}>Try clearing the search or picking a different category/month.</p>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map((trip) => {
                const date = dateLabel(trip, DATE_OPTS);
                const tags = parseCats(trip.categories).slice(0, 1);
                return (
                  <Link key={trip._id} to={`/trips/${trip.seoSlug || trip._id}`} className="tc">
                    <div className="tc-img">
                      {trip.cardImage ? <img className="tc-img-inner" src={trip.cardImage} alt={trip.title} loading="lazy" onError={(e) => { const p = e.currentTarget.parentElement; if (p) p.style.background = "linear-gradient(135deg,#1a3020,#2d6b4a)"; e.currentTarget.style.display = "none"; }} /> : <div className="tc-img-inner" style={{ background: "linear-gradient(135deg,#1a3020,#2d6b4a)" }} />}
                      <button className={`tc-fav${isSaved(trip._id) ? " on" : ""}`} aria-label={isSaved(trip._id) ? "Remove from saved" : "Save"} aria-pressed={isSaved(trip._id)} onClick={(e) => toggle(trip._id, e)}><FavoriteIcon sx={{ fontSize: 14 }} /></button>
                      {trip.tripOff ? <span className="tc-off">{trip.tripOff}% OFF</span> : null}
                      <div className="tc-rating"><StarIcon sx={{ fontSize: 12, color: "#f5a623" }} />{avgRating(trip).toFixed(1)}</div>
                      {tags.length > 0 && <div className="tc-tags">{tags.map((t, i) => <span className="tc-tag" key={i}>{t}</span>)}</div>}
                    </div>
                    <div className="tc-body">
                      <div className="tc-host">
                        <div className="tc-avatar">{initial(trip?.host?.hostName)}</div>
                        <span>by <b style={{ color: "var(--text-dark)" }}>{trip?.host?.hostName || "Nomadic Townies"}</b></span>
                        {trip?.host && <span className="tc-verified" style={{ marginLeft: "auto" }}><VerifiedIcon sx={{ fontSize: 13 }} />Verified</span>}
                      </div>
                      <h3 className="tc-title">{trip.title}</h3>
                      <div className="tc-meta">
                        {trip.location && <span className="tc-meta-item"><PlaceOutlinedIcon sx={{ fontSize: 12 }} />{trip.location}</span>}
                        {(trip.nights || trip.days) && <span className="tc-meta-item"><AccessTimeIcon sx={{ fontSize: 12 }} />{trip.nights}N / {trip.days}D</span>}
                        {date && <span className="tc-meta-item"><CalendarTodayIcon sx={{ fontSize: 11 }} />{date}</span>}
                      </div>
                      <div className="tc-foot">
                        <div className="tc-price"><b>₹{Number(trip.price || 0).toLocaleString("en-IN")}</b>{trip.strikePrice ? <s>₹{Number(trip.strikePrice).toLocaleString("en-IN")}</s> : null}<em>/ person</em></div>
                        <span className="btn btn-outline btn-sm">View</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* choose your adventure (live categories) */}
      {catNames.length > 0 && (
        // Reuse the Homepage category cards so both pages stay in sync.
        <CategoriesV3 showViewAll={false} />
      )}

      {/* trending */}
      {trending.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div style={{ marginBottom: 24 }}>
              <div className="section-label"><span className="section-label-bar" />Most popular right now</div>
              <h2 className="section-h">Trending Trips</h2>
              <p className="section-sub">Experiences filling up fast — don&apos;t miss your spot.</p>
            </div>
            <div className="trend-scroll">
              {trending.map((item, i) => {
                const td = dateLabel(item, DATE_OPTS);
                return (
                  <div key={item?._id || i} className="trend-card">
                    <div className="trend-img">
                      {item?.cardImage ? <img src={item.cardImage} alt={item?.title} loading="lazy" onError={(e) => { const p = e.currentTarget.parentElement; if (p) p.style.background = "linear-gradient(135deg,#1a2c5c,#2d4b9f)"; e.currentTarget.style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a2c5c,#2d4b9f)" }} />}
                      <div className="trend-rating"><StarIcon sx={{ fontSize: 12, color: "#f5a623" }} />{avgRating(item).toFixed(1)}</div>
                      {item?.price ? <div className="trend-price-tag"><span>₹{Number(item.price).toLocaleString("en-IN")} / person</span></div> : null}
                    </div>
                    <div className="trend-body">
                      <h3 className="trend-title">{item?.title}</h3>
                      <div className="trend-meta">
                        {item?.location && <span className="trend-meta-item"><PlaceOutlinedIcon sx={{ fontSize: 13 }} />{item.location}</span>}
                        {td && <span className="trend-meta-item"><CalendarTodayIcon sx={{ fontSize: 12 }} />{td}</span>}
                        {(item?.nights || item?.days) && <span className="trend-meta-item"><AccessTimeIcon sx={{ fontSize: 13 }} />{item.days}D/{item.nights}N</span>}
                      </div>
                      <div className="trend-foot">
                        <Link to={`/trips/${item?.seoSlug || item?._id}`} className="btn btn-orange btn-sm">Book Now</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* reviews */}
      {reviews.length > 0 && (
        <section className="section" style={{ background: "var(--orange-tint)" }}>
          <div className="wrap">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div className="section-label" style={{ justifyContent: "center" }}><span className="section-label-bar" />Reviews<span className="section-label-bar" /></div>
              <h2 className="section-h">What travellers say</h2>
            </div>
            <Swiper modules={[Autoplay]} spaceBetween={18} loop={reviews.length > 3} autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }} breakpoints={{ 0: { slidesPerView: 1.05 }, 600: { slidesPerView: 1.8 }, 900: { slidesPerView: 2.4 }, 1200: { slidesPerView: 3 } }}>
              {reviews.map((rev, i) => (
                <SwiperSlide key={rev?._id || i} style={{ height: "auto" }}>
                  <div className="testi">
                    <div className="testi-stars">{[1,2,3,4,5].map((s)=><StarIcon key={s} sx={{ fontSize: 16, color: s <= Math.round(avgRating(rev)) ? "#f5a623" : "#E4E4E7" }} />)}</div>
                    <p className="testi-text">&ldquo;{rev?.Review}&rdquo;</p>
                    <div className="testi-person">
                      <div className="testi-avatar">{rev?.Profile_Image ? <img src={rev.Profile_Image} alt={rev?.Name} /> : initial(rev?.Name)}</div>
                      <div><div className="testi-name">{rev?.Name}</div>{rev?.Job ? <div className="testi-role">{rev.Job}</div> : null}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* can't find CTA */}
      <section className="cta-band">
        <div className="wrap">
          <h2 style={{ fontFamily: "var(--playfair)", color: "#fff", fontSize: "clamp(26px,3.6vw,46px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 14 }}>Can&apos;t find what you&apos;re looking for?</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.85)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.6 }}>Tell us where you want to go and what you love — we&apos;ll help you find the right experience.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-lg" style={{ background: "#fff", color: "var(--orange)", fontWeight: 700 }} onClick={() => setOpene(true)}>Enquire Now</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllPackagesV3;
