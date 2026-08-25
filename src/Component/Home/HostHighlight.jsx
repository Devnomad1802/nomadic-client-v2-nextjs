"use client";

/* eslint-disable react/prop-types */
/**
 * HostHighlight — homepage "featured hosts" section. Host card ported from the
 * approved design (Structure 2a): a vertical stacked card — 16:10 cover on top,
 * overlapping avatar, then details and full-width CTAs. Uses the live hosts
 * query + `toCard` mapping (data/backend unchanged); the shared Meet-Our-Hosts
 * card is untouched. Renders nothing when no hosts are available.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetAllHostsQuery } from "../../services";
import { useGetTripsQuery } from "../../services/TripApis";
import { toCard } from "../Host/HostListingCard";
import HostFeatureCard, { HOST_CARD_CSS, countHostTrips } from "../Host/HostFeatureCard";

const HOMEPAGE_MAX = 6;


const HostHighlight = ({ hosts, trips }) => {
  const navigate = useNavigate();
  const { data } = useGetAllHostsQuery(undefined, { skip: Array.isArray(hosts) });
  const { data: tripsRes } = useGetTripsQuery(undefined, { skip: Array.isArray(trips) });

  const list = useMemo(() => {
    const src = Array.isArray(hosts) ? hosts : (data?.data || data || []);
    const tripList = Array.isArray(trips)
      ? trips
      : (Array.isArray(tripsRes?.data) ? tripsRes.data : Array.isArray(tripsRes) ? tripsRes : []);
    // Eligible = public (backend already gates on showOnWebsite; guard again).
    // Rank by real public-trip count DESC, verified as tiebreak, take top 6.
    // New hosts / changed trip counts re-rank automatically.
    return (Array.isArray(src) ? src : [])
      .filter((h) => h && h.showOnWebsite !== false)
      .map((h) => ({ h, n: countHostTrips(h, tripList) }))
      .sort((a, b) => b.n - a.n || (b.h?.isVerified ? 1 : 0) - (a.h?.isVerified ? 1 : 0))
      .slice(0, HOMEPAGE_MAX)
      .map(({ h, n }) => ({ ...toCard(h), experiences: n }));
  }, [hosts, data, trips, tripsRes]);

  if (list.length === 0) return null;

  return (
    <section className="section" style={{ background: "#fff" }}>
      <style>{HOST_CARD_CSS}</style>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: 32 }}>
          <div>
            <div className="section-label"><span className="section-label-bar" />The people behind it</div>
            <h2 className="section-h">The people worth travelling with.</h2>
            <p className="section-sub" style={{ marginTop: 8, maxWidth: 620 }}>
              A great host changes everything. The trail nobody photographs, the family who&apos;ll
              cook for you, the moment the light hits the valley. Meet a few of ours.
            </p>
          </div>
          <button className="btn btn-ghost btn-md" onClick={() => navigate("/hosts")}>
            Meet all our hosts <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </button>
        </div>
        <div className="hh2-grid">
          {list.map((c) => (
            <HostFeatureCard
              key={c.id}
              c={c}
              onOpen={(cc) => { navigate(`/hosts/${cc.seoSlug || cc.id}`); window.scrollTo(0, 0); }}
              onExperiences={(e, cc) => { e.stopPropagation(); navigate(`/hosts/${cc.seoSlug || cc.id}?tab=experiences`); window.scrollTo(0, 0); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HostHighlight;
