"use client";

/* eslint-disable react/prop-types */
/**
 * HostListingCard — the single source of truth for the "Meet Our Hosts" listing
 * card. Rendered on the Meet Our Hosts page AND in the host onboarding preview,
 * so both are always visually identical (no duplicate card markup).
 *
 * `toCard(host)` maps a raw Host object to the card view-model. Pass a ready card
 * as `c`. `preview` makes the CTAs inert (no navigation from the preview modal).
 */
import "../../PageComponents/meetHosts.css";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=65";
const DEFAULT_BIO = "Curating meaningful travel experiences with Nomadic Townies.";
const truncate = (s, n) => { const t = `${s || ""}`.trim(); return t.length > n ? `${t.slice(0, n).trim()}…` : t; };

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const cleanHostSlug = (slug, id) => {
  const s = String(slug || "").replace(/^\/?hosts?\//i, "").replace(/^\//, "").trim();
  return s || String(id || "");
};

export const toCard = (h) => ({
  id: h?._id,
  seoSlug: cleanHostSlug(h?.seoSlug, h?._id),
  name: h?.hostTitle || h?.hostName || "Host",
  specialty: (Array.isArray(h?.specialties) && h.specialties[0]) || h?.hostTitle || "",
  location: [h?.city, h?.state].filter(Boolean).join(", ") || h?.location || "",
  bio: h?.shortBio || h?.cardDescription || truncate(h?.hostOverview, 150) || h?.tagline || DEFAULT_BIO,
  image: h?.coverImage || h?.brandingLogo || DEFAULT_COVER,
  logo: h?.brandingLogo || "",
  rating: h?.rating != null ? Number(h.rating) : null,
  reviews: Number(h?.reviewCount ?? h?.reviewsCount ?? h?.totalReviews) || 0,
  experiences: h?.tripsHosted ?? 0,
  verified: h?.isVerified || h?.status === "approved",
  specialties: Array.isArray(h?.specialties) ? h.specialties : [],
  regions: Array.isArray(h?.regionsHosted) ? h.regionsHosted.filter(Boolean) : [],
  raw: h,
});

const VerifiedShield = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2Z" /></svg>
);
const AvatarFallback = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
const StarSvg = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.8 6.6 20l1-6.1L3.2 9.5l6.1-.9L12 3Z" /></svg>);
const PinSvg = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>);

const HostListingCard = ({ c, onOpen, onExperiences, preview = false }) => {
  const open = () => { if (!preview && onOpen) onOpen(c); };
  return (
    <div className="host-card" role={preview ? undefined : "link"} tabIndex={preview ? undefined : 0}
      onClick={open} onKeyDown={(e) => { if (!preview && e.key === "Enter") open(); }}
      style={preview ? { cursor: "default" } : undefined}>
      <div className="host-cover">
        {c.image ? <img src={c.image} alt={`${c.name} — verified host`} loading="lazy" /> : null}
        <div className="host-badges">
          {c.verified && <span className="badge badge-verified"><VerifiedShield size={10} />Verified Host</span>}
        </div>
        <div className="host-avatar">{c.logo ? <img src={c.logo} alt={c.name} /> : <AvatarFallback />}</div>
        <span className="host-rating-pill">{c.rating != null ? <><StarSvg />{c.rating.toFixed(1)}{c.reviews > 0 && <em>({c.reviews})</em>}</> : "New"}</span>
      </div>
      <div className="host-body">
        <div className="host-name-row">
          <span className="host-name">{c.name}</span>
          {c.verified && <span className="vrf" title="Verified Host"><VerifiedShield size={15} /></span>}
        </div>
        {c.location && <div className="host-loc"><PinSvg />{c.location}</div>}
        {c.specialties.length > 0 && (
          <div className="host-cats">
            {c.specialties.slice(0, 3).map((s) => <span key={s} className="host-cat">{s}</span>)}
          </div>
        )}
        {c.bio && <p className="host-bio">{c.bio}</p>}
        {c.regions.length > 0 && (
          <div className="host-regions"><PinSvg /> Hosts in {c.regions.slice(0, 3).join(", ")}{c.regions.length > 3 ? ` +${c.regions.length - 3}` : ""}</div>
        )}
        <div className="host-foot">
          <span className="host-exp"><b>{c.experiences}</b> hosted experience{c.experiences === 1 ? "" : "s"}</span>
          {c.reviews > 0 && <span className="host-reviews">{c.reviews} review{c.reviews === 1 ? "" : "s"}</span>}
        </div>
        <div className="host-cta">
          <button type="button" className="host-cta-primary" onClick={(e) => { e.stopPropagation(); open(); }}>View Profile</button>
          <button type="button" className="host-cta-secondary" onClick={(e) => { e.stopPropagation(); if (!preview && onExperiences) onExperiences(e, c); }}>View Experiences</button>
        </div>
      </div>
    </div>
  );
};

export default HostListingCard;
