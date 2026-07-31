"use client";

/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetTripsQuery } from "../../services/TripApis";
import { useBookmark } from "../../utils/useBookmark";
import { listableTrips, tripMonths, dateLabel } from "../../utils/tripVisibility";
import { useGetAllCategoriesQuery } from "../../services/categoriesApis";
import { TripCardSkeleton } from "../../SmallComponents/Skeletons";

const parseCats = (c) => {
  if (Array.isArray(c)) return c.flatMap(parseCats);
  if (typeof c === "string") {
    const s = c.trim();
    if (s.startsWith("[")) {
      try { const p = JSON.parse(s); return Array.isArray(p) ? p.map((x) => `${x}`.trim()) : [s]; }
      catch { return [s.replace(/[[\]"]/g, "").trim()]; }
    }
    return s ? [s] : [];
  }
  return [];
};

const inCategory = (t, cat) =>
  parseCats(t?.categories).some((c) => (c || "").trim().toLowerCase() === (cat || "").trim().toLowerCase());

const initial = (name) => (name ? name.trim()[0]?.toUpperCase() : "N");

const TripsV3 = ({ initialTrips = [], initialCategories = [] }) => {
  const navigate = useNavigate();
  const { isSaved, toggle } = useBookmark();
  // Use RTK Query for live client updates; fall back to server-provided initialTrips
  const { data, isLoading: queryLoading } = useGetTripsQuery();
  const { data: catData } = useGetAllCategoriesQuery();
  const [filter, setFilter] = useState("All");
  const [month, setMonth] = useState("All");

  // Use server-provided data on first render (SSR) then switch to live data once client loads
  const isLoading = queryLoading && initialTrips.length === 0;
  const rawTrips = data?.data?.length ? data.data : initialTrips;

  const filters = useMemo(() => {
    const names = catData?.data?.length
      ? catData.data.map((c) => c?.Category?.trim()).filter(Boolean)
      : initialCategories.map((c) => c?.Category?.trim()).filter(Boolean);
    return ["All", ...names];
  }, [catData, initialCategories]);

  // Central listing rules: future-dated batch trips (soonest first) + all
  // customized (flexible-date) trips — so nothing published is ever hidden.
  const upcomingAll = useMemo(() => listableTrips(rawTrips), [rawTrips]);

  // month chips derived from real batch dates, in chronological order
  const months = useMemo(() => {
    const seen = [];
    upcomingAll.forEach((t) =>
      tripMonths(t).forEach((m) => { if (!seen.includes(m)) seen.push(m); })
    );
    return ["All", ...seen];
  }, [upcomingAll]);

  const trips = useMemo(() => {
    let list = filter === "All" ? upcomingAll : upcomingAll.filter((t) => inCategory(t, filter));
    if (month !== "All") list = list.filter((t) => tripMonths(t).includes(month));
    return list.slice(0, 8);
  }, [upcomingAll, filter, month]);

  return (
    <section className="section" id="upcoming">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="section-label"><span className="section-label-bar" />Hand-picked &amp; host-verified</div>
            <h2 className="section-h">Upcoming Trips</h2>
            <p className="section-sub" style={{ marginTop: 8 }}>Curated experiences leaving in the next few weeks — browse, filter and book your spot.</p>
          </div>
          <Link to="/experiences" className="btn btn-outline btn-md" style={{ textDecoration: "none" }}>
            View All Experiences <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Link>
        </div>

        <div className="filters-row">
          <div className="chips-row">
            {filters.map((f) => (
              <button key={f} className={`chip${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          {months.length > 1 && (
            <div className="chips-row chips-right">
              {months.map((m) => (
                <button key={m} className={`chip${month === m ? " on" : ""}`} onClick={() => setMonth(m)}>{m}</button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <TripCardSkeleton count={4} />
        ) : trips.length === 0 ? (
          <p className="section-sub">No upcoming trips in this category right now — check back soon.</p>
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => {
              const date = dateLabel(trip);
              const verified = Boolean(trip?.host);
              return (
                <Link key={trip._id} to={`/trips/${trip.seoSlug || trip._id}`} className="tc">
                  <div className="tc-img">
                    {trip.cardImage
                      ? <img className="tc-img-inner" src={trip.cardImage} alt={trip.title} loading="lazy" onError={(e) => { const p = e.currentTarget.parentElement; if (p) p.style.background = "linear-gradient(135deg,#2c3e50,#4a6741)"; e.currentTarget.style.display = "none"; }} />
                      : <div className="tc-img-inner" style={{ background: "linear-gradient(135deg,#2c3e50,#4a6741)" }} />}
                    <button className={`tc-fav${isSaved(trip._id) ? " on" : ""}`} aria-label={isSaved(trip._id) ? "Remove from saved" : "Save"} aria-pressed={isSaved(trip._id)} onClick={(e) => toggle(trip._id, e)}>
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
                      <span className="btn btn-outline btn-sm" onClick={(e) => { e.preventDefault(); navigate(`/trips/${trip.seoSlug || trip._id}`); }}>View</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TripsV3;
