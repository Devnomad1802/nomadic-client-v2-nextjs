"use client";

/* eslint-disable react/prop-types */
/**
 * HostHighlight — homepage section that puts the hosts first, directly above
 * Upcoming Trips. Reuses the existing Meet-Our-Hosts card (HostListingCard) and
 * the live hosts data source, so it inherits the current design language and
 * shows real people — never fabricated ones. Degrades gracefully: if no hosts
 * are available it renders nothing.
 *
 * Optional `hosts` prop lets a server-fetched list be injected later without a
 * redesign; absent that, it reads the same client query the Meet Our Hosts page
 * already uses.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetAllHostsQuery } from "../../services";
import HostListingCard, { toCard } from "../Host/HostListingCard";

const HostHighlight = ({ hosts }) => {
  const navigate = useNavigate();
  const { data } = useGetAllHostsQuery(undefined, { skip: Array.isArray(hosts) });

  const list = useMemo(() => {
    const src = Array.isArray(hosts) ? hosts : (data?.data || data || []);
    return (Array.isArray(src) ? src : [])
      .filter((h) => h && h.showOnWebsite !== false)
      // verified hosts first, then take a small, curated few
      .sort((a, b) => (b?.isVerified ? 1 : 0) - (a?.isVerified ? 1 : 0))
      .slice(0, 4);
  }, [hosts, data]);

  // Graceful empty state — no fabricated hosts, no broken section.
  if (list.length === 0) return null;

  return (
    <section className="section mhpg" style={{ background: "#fff" }}>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: 36 }}>
          <div>
            <div className="section-label"><span className="section-label-bar" />The people behind it</div>
            <h2 className="section-h">The people worth travelling with.</h2>
            <p className="section-sub" style={{ marginTop: 8, maxWidth: 640 }}>
              A great host changes everything. They know the trail nobody photographs, the family
              who&apos;ll cook for you, the exact moment the light hits the valley. Here are a few of the
              hosts who make Nomadic Townies what it is.
            </p>
          </div>
          <button className="btn btn-ghost btn-md" onClick={() => navigate("/hosts")}>
            Meet all our hosts <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </button>
        </div>
        <div className="host-grid">
          {list.map((h) => (
            <HostListingCard
              key={h._id}
              c={toCard(h)}
              onOpen={(cc) => { navigate(`/hosts/${cc.seoSlug || cc.id}`); window.scrollTo(0, 0); }}
              onExperiences={(e, cc) => { e.preventDefault(); navigate(`/hosts/${cc.seoSlug || cc.id}?tab=experiences`); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HostHighlight;
