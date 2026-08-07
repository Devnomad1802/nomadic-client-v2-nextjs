"use client";

/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetAllCategoriesQuery } from "../../services/categoriesApis";
import { useGetTripsQuery } from "../../services/TripApis";
import { CategoryCardSkeleton } from "../../SmallComponents/Skeletons";
import { matchTemplate, DEFAULT_CATEGORIES } from "./categoryCards";

// A trip's categories can be nested/double-encoded, e.g. ['["INDIA"]'].
// Flatten recursively and strip stray brackets/quotes to plain names.
const parseCats = (s) => {
  const out = [];
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (typeof v !== "string") return;
    const str = v.trim();
    if (/^\[.*\]$/.test(str)) {
      try { return walk(JSON.parse(str)); } catch { /* fall through */ }
    }
    out.push(str.replace(/[[\]"]/g, "").trim());
  };
  walk(s);
  return out.filter(Boolean);
};
const inCategory = (trip, catName) =>
  parseCats(trip?.categories).some((c) => (c || "").toLowerCase().trim() === (catName || "").toLowerCase().trim());

const ChevSvg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

const CategoriesV3 = ({ sectionTitle, sectionSubtitle, showViewAll = true, carousel = false, initialCategories = [], initialTrips = [] }) => {
  const navigate = useNavigate();
  const { data, isLoading: catLoading } = useGetAllCategoriesQuery();
  const { data: tripData } = useGetTripsQuery();

  const cats = useMemo(() => {
    if (Array.isArray(data?.data) && data.data.length > 0) return data.data;
    if (Array.isArray(initialCategories) && initialCategories.length > 0) return initialCategories;
    return DEFAULT_CATEGORIES;
  }, [data, initialCategories]);

  const trips = useMemo(() => {
    if (Array.isArray(tripData?.data) && tripData.data.length > 0) return tripData.data;
    if (Array.isArray(initialTrips) && initialTrips.length > 0) return initialTrips;
    return [];
  }, [tripData, initialTrips]);

  const isLoading = catLoading && !data?.data?.length && !initialCategories.length;

  // Headline kept exactly as before; DB-overridable via props (managed in admin later).
  const title = sectionTitle || "Choose Your Adventure";
  const subtitle = sectionSubtitle || "From high-altitude treks to slow cultural immersions — find the experience, and the host, that fits you.";

  // count of trips + min price per category (used for the chip / "From ₹" / coming-soon).
  const stats = useMemo(() => {
    const m = {};
    cats.forEach((c) => {
      const name = c?.Category;
      const inCat = trips.filter((t) => inCategory(t, name));
      const prices = inCat
        .map((t) => parseInt(t?.price || t?.strikePrice || 0, 10))
        .filter((n) => Number.isFinite(n) && n > 0);
      const fallbackPrice = parseInt(c?.Starting_From || 0, 10) || 0;
      m[name] = {
        count: inCat.length,
        from: prices.length ? Math.min(...prices) : fallbackPrice,
      };
    });
    return m;
  }, [cats, trips]);

  const go = (item) => navigate(`/category/${item?.Category}`, { state: { item } });

  // ── Infinite marquee (homepage): a full-bleed track rendered TWICE and driven
  // by a single CSS transform keyframe (translateX 0 → -50%). Because both copies
  // are identical and each card carries its gap as margin, -50% lands exactly on
  // the seam — the loop is seamless with no JS, no re-renders, GPU-composited.
  // Pauses on hover and honours prefers-reduced-motion (both via CSS). ──
  const renderCard = (item, i, copy) => {
    const tpl = matchTemplate(item?.Category);
    const { count = 0, from = 0 } = stats[item?.Category] || {};
    const empty = count <= 0;
    return (
      <div
        className={`cat-card${empty ? " is-empty" : ""}`}
        key={`${copy}-${item?._id || i}`}
        onClick={() => go(item)}
        role="button"
        tabIndex={copy === 0 ? 0 : -1}
        aria-hidden={copy === 1 ? true : undefined}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go(item)}
      >
        <div className="cat-illus" style={{ background: tpl.gradient }}>
          <span className={`cat-count${empty ? " cat-count--soon" : ""}`}>
            {empty ? "Coming soon" : count === 1 ? (
              // A lone trip signals a thin marketplace — show "New" instead of "1 trip".
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>New</>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                {count} trips
              </>
            )}
          </span>
          {!empty && from > 0 && (
            <span className="cat-price-tag">
              <span className="cat-price-from">From</span>
              <span className="cat-price-val">₹{from.toLocaleString("en-IN")}</span>
            </span>
          )}
          {item?.Banner_Image ? (
            <img className="cat-photo" src={item.Banner_Image} alt={`${item?.Category || "Category"} trips`} loading="lazy" decoding="async" />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: tpl.scene }} style={{ display: "contents" }} />
          )}
        </div>
        <div className="cat-body">
          <div className="cat-name">{tpl.name || item?.Category}</div>
          <p className="cat-desc">{tpl.desc}</p>
          <div className="cat-foot">
            <div className="cat-tags">
              {tpl.tags.map((t) => <span className="cat-tag" key={t}>{t}</span>)}
            </div>
            <span className="cat-explore">{empty ? "Get notified" : "Explore"} <ChevSvg /></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="section" style={{ background: "var(--orange-tint)", paddingTop: 72, paddingBottom: 72 }}>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: 36 }}>
          <div>
            <div className="section-label"><span className="section-label-bar" />Browse by type</div>
            <h2 className="section-h">{title}</h2>
            <p className="section-sub" style={{ marginTop: 8 }}>{subtitle}</p>
          </div>
          {showViewAll && (
            <button className="btn btn-ghost btn-md" onClick={() => navigate("/experiences")}>
              View All <ArrowForwardIcon sx={{ fontSize: 15 }} />
            </button>
          )}
        </div>

        {isLoading ? (
          <CategoryCardSkeleton count={6} />
        ) : carousel ? (
          // Homepage only: full-bleed CSS-transform infinite track (see CSS).
          <div className="cats-marquee-wrap">
            <div className="cats-marquee" role="list" aria-label="Browse experiences by category">
              {/* two identical copies → seamless -50% loop; the 2nd is aria-hidden */}
              {cats.map((item, i) => renderCard(item, i, 0))}
              {cats.map((item, i) => renderCard(item, i, 1))}
            </div>
          </div>
        ) : (
          // Every other page (Experiences etc.): the original static grid.
          <div className="cats-grid">
            {cats.map((item, i) => renderCard(item, i, 0))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesV3;
