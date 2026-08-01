"use client";

/**
 * TripDetail.jsx — Trip Detail page (new "ticket/host-led" design).
 * Route: /trips/:slug   (Book Now -> /payment  with { paymentDetail: raw })
 * Reuses existing APIs (useGetTripsQuery, useGetAllReviewsQuery). Booking,
 * auth and payment flow are unchanged. Optional trip fields (difficulty,
 * bestSeason, groupSize, faqs, importantInfo, termsNotes) render only when set.
 */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useGetTripsQuery } from "../services/TripApis";
import { useGetAllReviewsQuery } from "../services";
import LoginModal from "../Modals/LoginModal";
import Footer from "../Component/Footer";

// Brand tokens — consistent with the rest of the site.
const ACCENT = "#CF4A2C";
const DISPLAY = "'Playfair Display','Playfair',serif";
const BODY = "'Inter',sans-serif";

// ─── data helpers ─────────────────────────────────────────────
const toNum = (v) => { const n = Number(v); return Number.isNaN(n) ? 0 : n; };
const inr = (n) => Math.round(Number(n) || 0).toLocaleString("en-IN");
const avg = (r) => {
  if (Array.isArray(r) && r.length) { const n = r.map(Number).filter((x) => !Number.isNaN(x)); return n.length ? n.reduce((a, b) => a + b, 0) / n.length : 0; }
  const x = Number(r); return Number.isNaN(x) ? 0 : x;
};
const splitList = (s) => {
  if (!s) return [];
  if (Array.isArray(s)) return s.filter(Boolean);
  return `${s}`.replace(/<[^>]+>/g, "\n").split(/\r?\n|;/).map((x) => x.trim()).filter(Boolean);
};
const parseArr = (v) => { try { const p = typeof v === "string" ? JSON.parse(v) : v; return Array.isArray(p) ? p : []; } catch { return []; } };
const parseCats = (c) => (Array.isArray(c) ? c : []).flatMap((x) => { try { const p = JSON.parse(x); return Array.isArray(p) ? p : [x]; } catch { return [x]; } });
const parseItinerary = (item) => {
  for (const k of ["addDays", "itinerary", "addsection"]) {
    const arr = parseArr(item?.[k]);
    if (arr.length && (arr[0]?.title || arr[0]?.heading || arr[0]?.day || arr[0]?.description)) {
      return arr.map((d, i) => ({
        title: d?.title || d?.heading || d?.day || `Day ${i + 1}`,
        desc: d?.description || d?.desc || d?.details || "",
        tags: Array.isArray(d?.tags) ? d.tags.filter(Boolean) : [],
      }));
    }
  }
  return [];
};

const STAR_STR = (n) => { const f = Math.round(n); return "★★★★★".slice(0, f) + "☆☆☆☆☆".slice(0, 5 - f); };

const mapTrip = (raw, allReviews) => {
  if (!raw) return null;
  const host = raw.host && typeof raw.host === "object" ? raw.host : null;

  // Reviews (reuses the existing global reviews API; trip-specific once a
  // per-trip source exists). Empty -> "No reviews yet" state.
  const reviews = (Array.isArray(allReviews) ? allReviews : []).slice(0, 6).map((r) => ({
    initial: (r?.Name || "T").trim().charAt(0).toUpperCase(),
    name: r?.Name || "Traveller",
    date: r?.Job || "",
    stars: STAR_STR(avg(r?.rating) || 5),
    text: r?.Review || "",
  })).filter((r) => r.text);
  const reviewCount = (Array.isArray(raw?.reviews) ? raw.reviews.length : 0) || reviews.length;
  const ratingNum = Number((avg(raw?.ratings) || (reviews.length ? 5 : 0)).toFixed(1));

  const ratingBars = [5, 4, 3, 2, 1].map((s) => {
    const c = reviews.filter((rv) => rv.stars.startsWith("★★★★★".slice(0, s)) && rv.stars.charAt(s) !== "★").length;
    const pct = reviews.length ? Math.round((c / reviews.length) * 100) : 0;
    return { stars: s, pct: `${pct}%` };
  });

  const days = toNum(raw.days);
  const nights = toNum(raw.nights);
  const duration = nights && days ? `${nights}N · ${days}D` : days ? `${days}D` : "";

  // Facts — only those with a value are shown.
  const facts = [
    raw.difficulty && { label: "Difficulty", value: raw.difficulty, key: "diff" },
    raw.groupSize && { label: "Group size", value: raw.groupSize, key: "group" },
    days && { label: "Duration", value: `${days} days`, key: "dur" },
    raw.bestSeason && { label: "Best season", value: raw.bestSeason, key: "season" },
  ].filter(Boolean);

  // Good-to-know accordion groups — only non-empty groups render.
  const thingsToCarry = splitList(raw.ThingsToCarry);
  const cancellation = splitList(raw.Cancellation);
  const faqs = (Array.isArray(raw.faqs) ? raw.faqs : []).filter((f) => f?.q && f?.a);
  const infoGroups = [
    thingsToCarry.length && { title: "Things to carry", kind: "list", items: thingsToCarry, open: true },
    cancellation.length && { title: "Cancellation policy", kind: "list", items: cancellation },
    raw.importantInfo && { title: "Important information", kind: "text", text: raw.importantInfo },
    raw.termsNotes && { title: "Terms & notes", kind: "text", text: raw.termsNotes },
    faqs.length && { title: "Frequently asked", kind: "faq", faqs },
  ].filter(Boolean);

  const images = (Array.isArray(raw.gallaryImages) && raw.gallaryImages.length
    ? raw.gallaryImages
    : [raw.bannerImage, raw.cardImage]).filter(Boolean);

  const hostYears = host?.experience || (host?.foundedYear ? `${Math.max(1, new Date().getFullYear() - parseInt(host.foundedYear, 10))} yrs` : "");

  return {
    id: raw._id,
    slug: raw.seoSlug || raw._id,
    title: raw.title || "Experience",
    subTitle: raw.subTitle || "",
    location: raw.location || "",
    duration,
    rating: ratingNum ? ratingNum.toFixed(1) : "",
    reviewCount,
    hasReviews: reviews.length > 0,
    photoCount: images.length,
    images,
    trending: !!raw.Trending,
    price: inr(raw.price),
    firstBookingPrice: toNum(raw.firstBookingPrice),
    // Partial enabled: admin flag on (legacy = derive from a positive amount).
    partialEnabled: raw.partialPaymentEnabled !== false && toNum(raw.firstBookingPrice) > 0,
    strikePrice: inr(raw.strikePrice),
    hasStrike: toNum(raw.strikePrice) > toNum(raw.price) && toNum(raw.strikePrice) > 0,
    off: toNum(raw.tripOff),
    hasOff: toNum(raw.tripOff) > 0,
    overview: raw.overview || "",
    categories: parseCats(raw.categories).map((label) => ({ label })),
    highlights: splitList(raw.highlights).map((label) => ({ label })),
    facts,
    itinerary: parseItinerary(raw),
    inclusions: splitList(raw.Inclusion).map((label) => ({ label })),
    exclusions: splitList(raw.Exclusion).map((label) => ({ label })),
    reviews,
    ratingBars,
    infoGroups,
    host: host && {
      id: host._id,
      name: host.hostTitle || host.hostName || "Verified Host",
      initial: (host.hostTitle || host.hostName || "H").trim().charAt(0).toUpperCase(),
      bio: host.hostOverview || host.shortBio || "",
      tripsHosted: host.tripsHosted ?? 0,
      years: hostYears,
      verified: !!host.isVerified,
      languages: (Array.isArray(host.languages) ? host.languages : []).filter(Boolean).map((label) => ({ label })),
      regions: (Array.isArray(host.regionsHosted) ? host.regionsHosted : []).filter(Boolean).map((label) => ({ label })),
    },
  };
};

const TD_CSS = `
  .td-page { font-family: ${BODY}; background: var(--surface-soft, #FBF6EE); min-height: 100vh; text-align: left; }
  .td-tab { transition: color .15s ease, border-color .15s ease; cursor: pointer; border: none; background: transparent; }
  .td-cta { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
  .td-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(205,72,42,.32); background: #B83F23; }
  .td-ghost { transition: background .16s ease, border-color .16s ease; }
  .td-ghost:hover { background: #FBF6EE; border-color: ${ACCENT}; }
  .td-thumb { transition: transform .4s ease; }
  .td-thumb:hover { transform: scale(1.05); }
  details.td-acc > summary { list-style: none; cursor: pointer; }
  details.td-acc > summary::-webkit-details-marker { display: none; }
  details.td-acc[open] .td-acc-ic { transform: rotate(45deg); }
  .td-sec { scroll-margin-top: 132px; }
  .td-hero { display: grid; grid-template-columns: 1fr; grid-template-rows: auto; gap: 8px; height: auto; }
  .td-grid { display: grid; grid-template-columns: 1fr; gap: clamp(24px,3.5vw,48px); align-items: start; }
  .td-side { position: static; }
  @media (min-width: 1040px) {
    .td-grid { grid-template-columns: minmax(0,1fr) 388px; }
    .td-hero { grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 1fr 1fr; height: 460px; }
    .td-hero-a { grid-row: 1 / 3; }
    .td-side { position: sticky; top: 80px; }
    .td-mcta { display: none !important; }
  }
  @media (max-width: 1039px) {
    .td-hero-hide { display: none !important; }
    .td-footer-wrap { padding-bottom: 88px; background: #1A1A1A; }
  }
  .td-footer-wrap { margin-top: clamp(40px,6vw,72px); }
`;

const Ic = ({ paths, w = 17, fill }) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill={fill || "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);
const FACT_ICONS = {
  diff: ["M3 20h18", "M5 20V10l4-3 4 4 6-5v14"],
  group: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M23 21v-2a4 4 0 0 0-3-3.87"],
  dur: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "M12 7v5l3 2"],
  season: ["M8 2v4M16 2v4M3 9h18", "M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"],
};
const HERO_GRADS = [
  "linear-gradient(135deg,#5a4a3a,#33281d)", "linear-gradient(135deg,#6f6a63,#403c38)",
  "linear-gradient(135deg,#5c3a1a,#a8703a)", "linear-gradient(135deg,#1a3a5c,#3a6ca8)",
  "linear-gradient(135deg,#3a2c1a,#7a5c3a)",
];

const TABS = [
  ["td-overview", "Overview"], ["td-host", "Host"], ["td-itinerary", "Itinerary"],
  ["td-inclusions", "Inclusions"], ["td-reviews", "Reviews"], ["td-info", "Good to know"],
];

export default function TripDetail({ initialRaw, initialReviews }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userDbData } = useSelector((s) => s.global);
  const { data: tripsRes } = useGetTripsQuery(undefined, { skip: !!initialRaw });
  const { data: revRes } = useGetAllReviewsQuery(undefined, { skip: !!initialReviews });
  const [active, setActive] = useState("Overview");
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [openL, setOpenL] = useState(false);
  const [lbIndex, setLbIndex] = useState(null); // gallery lightbox: null = closed
  const rootRef = useRef(null);

  const raw = useMemo(() => {
    if (initialRaw) return initialRaw;
    const list = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
    return list.find((t) => t.seoSlug === slug) || list.find((t) => t._id === slug);
  }, [tripsRes, slug, initialRaw]);

  const trip = useMemo(() => {
    const reviews = initialReviews || revRes?.data;
    return mapTrip(raw, reviews);
  }, [raw, revRes, initialReviews]);

  useEffect(() => {
    if (!trip) return undefined;
    const onScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      let cur = active;
      TABS.forEach(([id, label]) => {
        const el = root.querySelector(`#${id}`);
        if (el && el.getBoundingClientRect().top <= 150) cur = label;
      });
      setActive((prev) => (cur !== prev ? cur : prev));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id]);

  // Gallery lightbox: keyboard nav + lock body scroll while open.
  useEffect(() => {
    if (lbIndex === null) return undefined;
    const imgs = trip?.images || [];
    const onKey = (e) => {
      if (e.key === "Escape") setLbIndex(null);
      else if (e.key === "ArrowRight") setLbIndex((x) => (x + 1) % imgs.length);
      else if (e.key === "ArrowLeft") setLbIndex((x) => (x - 1 + imgs.length) % imgs.length);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [lbIndex, trip?.images]);

  if (tripsRes && !raw) return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#726A5E" }}>Trip not found.</div>;
  if (!trip) return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#726A5E" }}>Loading…</div>;

  const goTo = (id, label) => () => {
    setActive(label);
    const el = rootRef.current?.querySelector(`#${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 118, behavior: "smooth" });
  };

  const handleBookNow = () => {
    if (!userDbData) { setOpenL(true); return; }
    navigate("/payment", { state: { paymentDetail: raw } }); // unchanged booking flow
  };

  const goHost = () => {
    const target = trip.host?.seoSlug || trip.host?.id || trip.host?._id;
    if (target) {
      navigate(`/hosts/${target}`);
      window.scrollTo(0, 0);
    }
  };

  const fullItinerary = trip.itinerary;
  const itineraryMore = fullItinerary.length > 4;
  const itinerary = (itineraryOpen ? fullItinerary : fullItinerary.slice(0, 4))
    .map((d, i) => ({ ...d, num: String(i + 1).padStart(2, "0") }));

  const sectionH2 = { margin: "0 0 16px", fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(22px,2.6vw,27px)", letterSpacing: "-.01em", color: "#221C17" };
  const card = { background: "#FFFFFF", border: "1px solid #E6DDCF", borderRadius: "16px" };

  return (
    <div className="td-page" ref={rootRef}>
      <Helmet>
        <title>{`${trip.title} | Book Now | Nomadic Townies`}</title>
        <meta name="description" content={trip.overview ? trip.overview.slice(0, 150) : "Book this host-led experience with Nomadic Townies."} />
        <link rel="canonical" href={`https://www.nomadictownies.com/trips/${trip.slug}`} />
      </Helmet>
      <style>{TD_CSS}</style>
      <LoginModal openL={openL} setOpenL={setOpenL} />

      {/* STICKY TOP BREADCRUMB HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "#FFFFFF",
          borderBottom: "1px solid #E6DDCF",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "clamp(12px, 1.5vw, 16px) clamp(16px, 4vw, 48px)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <button
            type="button"
            className="td-ghost"
            aria-label="Back"
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              flex: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #E6DDCF",
              background: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              color: "#221C17",
            }}
          >
            ←
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              font: `500 13px/1 ${BODY}`,
              color: "#9A9080",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
              Home
            </span>
            <span>›</span>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/experiences")}>
              Experiences
            </span>
            <span>›</span>
            <span
              style={{
                color: "#221C17",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {trip.title}
            </span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(18px,2.5vw,32px) clamp(16px,4vw,48px) 0" }}>
        {/* HERO GALLERY */}
        <div className="td-hero" style={{ borderRadius: "22px", overflow: "hidden", marginBottom: "26px", position: "relative" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} onClick={() => trip.images[i] && setLbIndex(i)} className={i === 0 ? "td-hero-a" : "td-hero-hide td-thumb"} style={{ position: "relative", overflow: "hidden", minHeight: i === 0 ? 250 : undefined, background: HERO_GRADS[i], cursor: trip.images[i] ? "pointer" : "default" }}>
              {trip.images[i] && <img src={trip.images[i]} alt={i === 0 ? trip.title : ""} loading={i === 0 ? "eager" : "lazy"} onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
          ))}
          {trip.photoCount > 0 && (
            <button type="button" onClick={() => setLbIndex(0)} className="td-ghost" style={{ position: "absolute", right: 18, bottom: 18, display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 15px", background: "#FFFDF9", color: "#221C17", border: "1px solid #E6DDCF", borderRadius: "10px", font: `600 13px/1 ${BODY}`, cursor: "pointer" }}>All {trip.photoCount} photos</button>
          )}
        </div>

        {/* GRID */}
        <div className="td-grid">
          {/* ===== MAIN ===== */}
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(28px,3.8vw,42px)", lineHeight: 1.06, letterSpacing: "-.02em", color: "#221C17", textWrap: "balance" }}>{trip.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginTop: "14px" }}>
              {trip.location && <span style={{ display: "flex", alignItems: "center", gap: "6px", font: `500 14.5px/1 ${BODY}`, color: "#726A5E" }}><span style={{ color: ACCENT, display: "flex" }}><Ic w={15} paths={["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", "M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"]} /></span>{trip.location}</span>}
              {trip.duration && <span style={{ display: "flex", alignItems: "center", gap: "6px", font: `500 14.5px/1 ${BODY}`, color: "#726A5E" }}><span style={{ color: ACCENT, display: "flex" }}><Ic w={15} paths={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "M12 7v5l3 2"]} /></span>{trip.duration}</span>}
              {trip.hasReviews ? (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", font: `600 14.5px/1 ${BODY}`, color: "#221C17" }}><span style={{ color: "#E0922F", display: "flex" }}><Ic w={15} fill="#E0922F" paths={["m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6.2 3.5 1.6-6.8L2 9.1l7-.6L12 2Z"]} /></span>{trip.rating} <span style={{ color: "#9A9080", fontWeight: 500 }}>({trip.reviewCount} reviews)</span></span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", font: `600 13.5px/1 ${BODY}`, color: "#9A9080" }}>New experience</span>
              )}
            </div>

            {trip.categories.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "18px" }}>
                {trip.categories.map((c, i) => <span key={i} style={{ padding: "7px 14px", borderRadius: "99px", background: "var(--brand-100, #F6E4DC)", border: "1px solid #E6DDCF", color: ACCENT, font: `600 13px/1 ${BODY}` }}>{c.label}</span>)}
              </div>
            )}

            {/* quick facts */}
            {trip.facts.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "12px", marginTop: "24px" }}>
                {trip.facts.map((f) => (
                  <div key={f.key} style={{ ...card, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: ACCENT, marginBottom: "9px" }}><Ic paths={FACT_ICONS[f.key]} /></div>
                    <div style={{ font: `400 12px/1 ${BODY}`, color: "#9A9080" }}>{f.label}</div>
                    <div style={{ marginTop: "4px", font: `700 15px/1.25 ${BODY}`, color: "#221C17" }}>{f.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* STICKY TABS */}
            <div style={{ position: "sticky", top: 64, zIndex: 20, background: "var(--surface-soft, #FBF6EE)", paddingTop: "16px", marginTop: "30px" }}>
              <div style={{ display: "flex", gap: "28px", borderBottom: "1px solid #E6DDCF", overflowX: "auto" }}>
                {TABS.map(([id, label]) => (
                  <button key={id} type="button" className="td-tab" onClick={goTo(id, label)} style={{ padding: "14px 2px", font: `600 14px/1 ${BODY}`, color: active === label ? ACCENT : "#8A8073", borderBottom: `2px solid ${active === label ? ACCENT : "transparent"}`, whiteSpace: "nowrap" }}>{label}</button>
                ))}
              </div>
            </div>

            {/* OVERVIEW */}
            <section id="td-overview" className="td-sec" style={{ marginTop: "34px" }}>
              <h2 style={{ ...sectionH2, marginBottom: "18px" }}>About this experience</h2>
              <div style={{ ...card, padding: "clamp(20px,2.4vw,28px)" }}>
                <p style={{ margin: 0, font: `400 16px/1.75 ${BODY}`, color: "#3C3228", whiteSpace: "pre-line" }}>{trip.overview || "Details coming soon."}</p>
                {trip.highlights.length > 0 && (
                  <>
                    <div style={{ font: `700 12px/1 ${BODY}`, letterSpacing: ".08em", textTransform: "uppercase", color: "#A89C8A", margin: "24px 0 14px", paddingTop: "20px", borderTop: "1px solid #E6DDCF" }}>Highlights</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "12px" }}>
                      {trip.highlights.map((h, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "11px", font: `400 15px/1.55 ${BODY}`, color: "#3C3228" }}>
                          <span style={{ flex: "none", width: 22, height: 22, marginTop: 1, borderRadius: "7px", background: "#FCE8E1", color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic w={13} paths={["M20 6 9 17l-5-5"]} /></span>
                          <span>{h.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* HOST */}
            {trip.host && (
              <section id="td-host" className="td-sec" style={{ marginTop: "40px", background: "#221C17", borderRadius: "22px", padding: "clamp(24px,3vw,34px)", color: "#F4EEE4", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -50, top: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(233,98,47,.26),transparent 66%)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ font: `700 12px/1 ${BODY}`, letterSpacing: ".12em", textTransform: "uppercase", color: "#F0B49C", marginBottom: "18px" }}>Meet your host</div>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ position: "relative", flex: "none" }}>
                      <div style={{ width: 80, height: 80, borderRadius: "18px", background: `linear-gradient(150deg,#E9622F,${ACCENT})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: "33px", color: "#FFF6EF" }}>{trip.host.initial}</div>
                      {trip.host.verified && <span style={{ position: "absolute", right: -8, bottom: -8, width: 30, height: 30, borderRadius: "50%", background: "#2E7D4F", border: "3px solid #221C17", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Ic w={15} paths={["M20 6 9 17l-5-5"]} /></span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "24px", letterSpacing: "-.01em", color: "#F8F4ED" }}>{trip.host.name}</span>
                        {trip.host.verified && <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "99px", background: "rgba(91,191,122,.18)", border: "1px solid rgba(91,191,122,.4)", color: "#A8E6BC", font: `700 10px/1 ${BODY}`, letterSpacing: ".04em", textTransform: "uppercase" }}>Verified host</span>}
                      </div>
                      <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginTop: "10px" }}>
                        <span style={{ font: `600 13px/1 ${BODY}`, color: "#E6DDCF" }}>{trip.host.tripsHosted} <span style={{ color: "#9C9388", fontWeight: 400 }}>trips hosted</span></span>
                        {trip.host.years && <span style={{ font: `600 13px/1 ${BODY}`, color: "#E6DDCF" }}>{trip.host.years} <span style={{ color: "#9C9388", fontWeight: 400 }}>hosting</span></span>}
                      </div>
                    </div>
                  </div>
                  {trip.host.bio && <p style={{ margin: "18px 0 0", font: `400 15px/1.7 ${BODY}`, color: "#C9BFAE", maxWidth: "68ch" }}>{trip.host.bio}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginTop: "20px" }}>
                    {trip.host.languages.length > 0 && (
                      <div>
                        <div style={{ font: `700 11px/1 ${BODY}`, letterSpacing: ".08em", textTransform: "uppercase", color: "#8A8073", marginBottom: "8px" }}>Speaks</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{trip.host.languages.map((l, i) => <span key={i} style={{ padding: "5px 11px", borderRadius: "99px", border: "1px solid rgba(244,238,228,.22)", font: `600 12px/1 ${BODY}`, color: "#E6DDCF" }}>{l.label}</span>)}</div>
                      </div>
                    )}
                    {trip.host.regions.length > 0 && (
                      <div>
                        <div style={{ font: `700 11px/1 ${BODY}`, letterSpacing: ".08em", textTransform: "uppercase", color: "#8A8073", marginBottom: "8px" }}>Regions</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{trip.host.regions.map((r, i) => <span key={i} style={{ padding: "5px 11px", borderRadius: "99px", border: "1px solid rgba(244,238,228,.22)", font: `600 12px/1 ${BODY}`, color: "#E6DDCF" }}>{r.label}</span>)}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
                    <button type="button" className="td-cta" onClick={goHost} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 22px", font: `700 14px/1 ${BODY}`, color: "#fff", background: ACCENT, border: "none", borderRadius: "11px", cursor: "pointer" }}>View host profile →</button>
                    <button type="button" onClick={goHost} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px", font: `700 14px/1 ${BODY}`, color: "#F4EEE4", background: "transparent", border: "1px solid rgba(244,238,228,.3)", borderRadius: "11px", cursor: "pointer" }}>Message host</button>
                  </div>
                </div>
              </section>
            )}

            {/* ITINERARY */}
            {itinerary.length > 0 && (
              <section id="td-itinerary" className="td-sec" style={{ marginTop: "40px" }}>
                <h2 style={{ ...sectionH2, marginBottom: "18px" }}>Day-by-day itinerary</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {itinerary.map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: "16px", background: "#FFFFFF", border: "1px solid #E6DDCF", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 1px 2px rgba(60,42,28,.04)" }}>
                      <span style={{ flex: "none", width: 44, height: 44, borderRadius: "12px", background: "#FCE8E1", color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: "16px" }}>{d.num}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ font: `700 10.5px/1 ${BODY}`, letterSpacing: ".1em", textTransform: "uppercase", color: "#A89C8A", marginBottom: "5px" }}>Day {Number(d.num)}</div>
                        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "18px", lineHeight: 1.25, color: "#221C17" }}>{d.title}</div>
                        {d.desc && <p style={{ margin: "8px 0 0", font: `400 14.5px/1.7 ${BODY}`, color: "#5A5247", whiteSpace: "pre-line" }}>{d.desc}</p>}
                        {d.tags.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>{d.tags.map((t, j) => <span key={j} style={{ padding: "4px 10px", borderRadius: "99px", background: "var(--brand-100, #F6E4DC)", border: "1px solid #E6DDCF", font: `600 11px/1 ${BODY}`, color: ACCENT }}>{typeof t === "string" ? t : t.label}</span>)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                {itineraryMore && (
                  <button type="button" onClick={() => setItineraryOpen((v) => !v)} className="td-ghost" style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 20px", border: "1px solid #E6DDCF", background: "#FFFFFF", borderRadius: "11px", font: `600 13.5px/1 ${BODY}`, color: "#5A5247", cursor: "pointer" }}>
                    {itineraryOpen ? "Show less" : `Show full ${fullItinerary.length}-day itinerary`}
                  </button>
                )}
              </section>
            )}

            {/* INCLUSIONS / EXCLUSIONS */}
            {(trip.inclusions.length > 0 || trip.exclusions.length > 0) && (
              <section id="td-inclusions" className="td-sec" style={{ marginTop: "40px" }}>
                <h2 style={{ ...sectionH2, marginBottom: "18px" }}>What&apos;s included</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" }}>
                  {trip.inclusions.length > 0 && (
                    <div style={{ ...card, padding: "22px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}><span style={{ color: "#2E7D4F" }}><Ic w={19} paths={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "m8 12 3 3 5-6"]} /></span><span style={{ font: `700 15px/1 ${BODY}`, color: "#221C17" }}>Included</span></div>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {trip.inclusions.map((it, i) => <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", font: `400 14.5px/1.55 ${BODY}`, color: "#5A5247" }}><span style={{ flex: "none", color: "#2E7D4F", marginTop: 2 }}><Ic w={14} paths={["M20 6 9 17l-5-5"]} /></span><span>{it.label}</span></li>)}
                      </ul>
                    </div>
                  )}
                  {trip.exclusions.length > 0 && (
                    <div style={{ ...card, padding: "22px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}><span style={{ color: "#C0392B" }}><Ic w={19} paths={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "m15 9-6 6M9 9l6 6"]} /></span><span style={{ font: `700 15px/1 ${BODY}`, color: "#221C17" }}>Not included</span></div>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {trip.exclusions.map((e, i) => <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", font: `400 14.5px/1.55 ${BODY}`, color: "#5A5247" }}><span style={{ flex: "none", color: "#C0392B", marginTop: 2 }}><Ic w={14} paths={["M18 6 6 18M6 6l12 12"]} /></span><span>{e.label}</span></li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* REVIEWS */}
            <section id="td-reviews" className="td-sec" style={{ marginTop: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <h2 style={{ ...sectionH2, margin: 0 }}>Trip reviews</h2>
                <span style={{ padding: "4px 11px", borderRadius: "99px", background: "var(--brand-100, #F6E4DC)", border: "1px solid #E6DDCF", color: ACCENT, font: `600 11px/1 ${BODY}` }}>This experience only</span>
              </div>
              {!trip.hasReviews ? (
                <div style={{ marginTop: "14px", textAlign: "center", padding: "44px 24px", background: "#FFFFFF", border: "1px dashed #E6DDCF", borderRadius: "16px" }}>
                  <p style={{ margin: "0 0 6px", font: `700 16px/1.4 ${BODY}`, color: "#221C17" }}>No reviews yet</p>
                  <p style={{ margin: "0 auto", maxWidth: 420, font: `400 14px/1.55 ${BODY}`, color: "#8A8073" }}>This is a new experience. Be one of the first to travel {trip.host ? `with ${trip.host.name}` : "with this host"} and share your story.</p>
                </div>
              ) : (
                <>
                  <p style={{ margin: "0 0 18px", font: `400 13.5px/1.4 ${BODY}`, color: "#9A9080" }}>From travellers who booked this trip — separate from host and brand reviews.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "26px", alignItems: "center", padding: "22px 26px", background: "var(--brand-100, #F6E4DC)", border: "1px solid #E6DDCF", borderRadius: "16px", marginBottom: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "46px", lineHeight: 1, color: "#221C17" }}>{trip.rating}</div>
                      <div style={{ marginTop: "5px", color: "#E0922F", fontSize: "14px", letterSpacing: "2px" }}>★★★★★</div>
                      <div style={{ marginTop: "4px", font: `500 12px/1 ${BODY}`, color: "#8A8073" }}>{trip.reviewCount} reviews</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: "7px" }}>
                      {trip.ratingBars.map((bar) => (
                        <div key={bar.stars} style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ font: `600 12px/1 ${BODY}`, color: "#8A8073", width: 28 }}>{bar.stars}★</span><span style={{ flex: 1, height: 7, borderRadius: "99px", background: "#F3E8E2", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: bar.pct, background: ACCENT }} /></span></div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "14px" }}>
                    {trip.reviews.map((rv, i) => (
                      <div key={i} style={{ padding: "18px 20px", border: "1px solid #E6DDCF", borderRadius: "14px", background: "#FFFFFF" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                          <span style={{ width: 38, height: 38, flex: "none", borderRadius: "50%", background: "#FCE8E1", color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", font: `700 15px/1 ${BODY}` }}>{rv.initial}</span>
                          <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: `600 14px/1.2 ${BODY}`, color: "#221C17" }}>{rv.name}</div>{rv.date && <div style={{ font: `400 11.5px/1 ${BODY}`, color: "#9A9080", marginTop: 2 }}>{rv.date}</div>}</div>
                          <span style={{ color: "#E0922F", fontSize: "12px" }}>{rv.stars}</span>
                        </div>
                        <p style={{ margin: "12px 0 0", font: `400 14px/1.65 ${BODY}`, color: "#5A5247" }}>{rv.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* GOOD TO KNOW */}
            {trip.infoGroups.length > 0 && (
              <section id="td-info" className="td-sec" style={{ marginTop: "40px" }}>
                <h2 style={{ ...sectionH2, marginBottom: "18px" }}>Good to know</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {trip.infoGroups.map((g, i) => (
                    <details key={i} className="td-acc" open={!!g.open} style={{ border: "1px solid #E6DDCF", borderRadius: "14px", background: "#FFFFFF", overflow: "hidden" }}>
                      <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", padding: "17px 20px", fontFamily: DISPLAY, fontWeight: 700, fontSize: "16px", color: "#221C17" }}>{g.title}<span className="td-acc-ic" style={{ flex: "none", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#FCE8E1", color: ACCENT, transition: "transform .2s ease", fontSize: "16px" }}>+</span></summary>
                      <div style={{ padding: "0 20px 18px" }}>
                        {g.kind === "list" && (
                          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                            {g.items.map((it, j) => <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px", font: `400 14.5px/1.6 ${BODY}`, color: "#5A5247" }}><span style={{ flex: "none", width: 6, height: 6, marginTop: 8, borderRadius: "50%", background: ACCENT }} /><span>{typeof it === "string" ? it : it.label}</span></li>)}
                          </ul>
                        )}
                        {g.kind === "text" && <p style={{ margin: 0, font: `400 14.5px/1.7 ${BODY}`, color: "#5A5247", whiteSpace: "pre-line", maxWidth: "70ch" }}>{g.text}</p>}
                        {g.kind === "faq" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {g.faqs.map((q, j) => <div key={j}><div style={{ font: `600 14.5px/1.4 ${BODY}`, color: "#221C17" }}>{q.q}</div><p style={{ margin: "5px 0 0", font: `400 14px/1.6 ${BODY}`, color: "#726A5E", maxWidth: "70ch" }}>{q.a}</p></div>)}
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ===== BOOKING SIDEBAR ===== */}
          <aside className="td-side" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E6DDCF", borderRadius: "18px", overflow: "hidden", boxShadow: "0 12px 30px -16px rgba(0,0,0,.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "12px 20px", background: "var(--brand-100, #F6E4DC)", borderBottom: "1px solid #E6DDCF" }}>
                <span style={{ font: `500 12px/1.35 ${BODY}`, color: "#7C3A27" }}>Pay a little now, adventure a lot — flexible payments at checkout.</span>
              </div>
              <div style={{ padding: "18px 22px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ font: `600 11px/1 ${BODY}`, color: "#9A9080" }}>Starting from</span>
                  {trip.hasOff && <span style={{ padding: "4px 10px", borderRadius: "99px", background: "#E0EFE4", color: "#2E7D4F", font: `700 10px/1 ${BODY}` }}>✦ {trip.off}% OFF</span>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "9px", flexWrap: "wrap", marginBottom: "16px" }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "32px", letterSpacing: "-.02em", color: "#221C17" }}>₹ {trip.price}</span>
                  {trip.hasStrike && <span style={{ font: `600 13px/1 ${BODY}`, color: "#B3ABA3", textDecoration: "line-through" }}>₹ {trip.strikePrice}</span>}
                  <span style={{ font: `500 12px/1 ${BODY}`, color: "#9A9080" }}>/ person</span>
                </div>
                <button type="button" className="td-cta" onClick={handleBookNow} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "15px", font: `700 15px/1 ${BODY}`, color: "#fff", background: ACCENT, border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: "0 8px 20px rgba(205,72,42,.26)" }}>Book now <span style={{ fontSize: "16px" }}>→</span></button>
                {trip.partialEnabled && (
                  <p style={{ margin: "10px 0 0", textAlign: "center", font: `600 11.5px/1.4 ${BODY}`, color: "#2E7D4F" }}>
                    Book now for ₹ {inr(trip.firstBookingPrice)} — balance due 15 days before departure
                  </p>
                )}
                <p style={{ margin: "10px 0 0", textAlign: "center", font: `400 11.5px/1.4 ${BODY}`, color: "#9A9080" }}>Select a batch date on the next step</p>
              </div>
              <div style={{ padding: "14px 22px", borderTop: "1px solid #E6DDCF", background: "var(--brand-100, #F6E4DC)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Secure payments · verified host", "Hand-picked, community-first trip", "On-platform host support"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", font: `400 12.5px/1.3 ${BODY}`, color: "#5A5247" }}><span style={{ color: "#2E7D4F", flex: "none", display: "flex" }}><Ic w={15} paths={["M20 6 9 17l-5-5"]} /></span>{t}</div>
                ))}
              </div>
            </div>

            {trip.host && (
              <div style={{ background: "#FFFFFF", border: "1px solid #E6DDCF", borderRadius: "18px", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                  <span style={{ width: 42, height: 42, flex: "none", borderRadius: "11px", background: `linear-gradient(150deg,#E9622F,${ACCENT})`, color: "#FFF6EF", display: "flex", alignItems: "center", justifyContent: "center", font: `700 16px/1 ${BODY}` }}>{trip.host.initial}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: `400 11px/1 ${BODY}`, color: "#9A9080" }}>Your host</div><div style={{ marginTop: 3, font: `600 14px/1.2 ${BODY}`, color: "#221C17" }}>{trip.host.name}</div></div>
                </div>
                <button type="button" className="td-ghost" onClick={goHost} style={{ width: "100%", marginTop: "14px", padding: "12px", font: `700 13px/1 ${BODY}`, color: "#221C17", background: "#fff", border: "1px solid #E6DDCF", borderRadius: "11px", cursor: "pointer" }}>Message on Nomadic Townies</button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* MOBILE STICKY CTA */}
      <div className="td-mcta" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#FFFFFF", borderTop: "1px solid #E6DDCF" }}>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "19px", color: "#221C17" }}>₹ {trip.price}</div><div style={{ font: `400 11px/1 ${BODY}`, color: "#9A9080" }}>per person</div></div>
        <button type="button" className="td-cta" onClick={handleBookNow} style={{ flex: "none", padding: "14px 30px", font: `700 15px/1 ${BODY}`, color: "#fff", background: ACCENT, border: "none", borderRadius: "12px", cursor: "pointer" }}>Book now →</button>
      </div>

      {/* GALLERY LIGHTBOX */}
      {lbIndex !== null && trip.images[lbIndex] && (
        <div onClick={() => setLbIndex(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,16,12,.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(52px,8vw,72px) clamp(12px,4vw,64px)" }}>
          <button type="button" aria-label="Close" onClick={() => setLbIndex(null)} style={{ position: "absolute", top: 16, right: 16, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(255,255,255,.12)", color: "#fff", border: "none", cursor: "pointer", fontSize: "20px" }}>✕</button>
          {trip.images.length > 1 && (
            <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setLbIndex((x) => (x - 1 + trip.images.length) % trip.images.length); }} style={{ position: "absolute", left: "clamp(8px,2vw,24px)", top: "50%", transform: "translateY(-50%)", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(255,255,255,.12)", color: "#fff", border: "none", cursor: "pointer", fontSize: "24px" }}>‹</button>
          )}
          <img src={trip.images[lbIndex]} alt={`${trip.title} — photo ${lbIndex + 1}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }} />
          {trip.images.length > 1 && (
            <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); setLbIndex((x) => (x + 1) % trip.images.length); }} style={{ position: "absolute", right: "clamp(8px,2vw,24px)", top: "50%", transform: "translateY(-50%)", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(255,255,255,.12)", color: "#fff", border: "none", cursor: "pointer", fontSize: "24px" }}>›</button>
          )}
          <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", font: `600 13px/1 ${BODY}`, color: "rgba(255,255,255,.85)" }}>{lbIndex + 1} / {trip.images.length}</div>
        </div>
      )}

      <div className="td-footer-wrap">
        <Footer />
      </div>
    </div>
  );
}
