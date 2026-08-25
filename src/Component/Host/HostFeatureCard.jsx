"use client";

/* eslint-disable react/prop-types */
/**
 * HostFeatureCard — the approved homepage host card (Structure 2a: 16:9 cover,
 * overlapping avatar, details, full-width CTAs). Shared by the homepage
 * "People behind it" section and the Meet Our Hosts page so both render the
 * exact same card. Feed it a card view-model from `toCard` (HostListingCard).
 *
 * `HOST_CARD_CSS` is the card's scoped styles; render it once per page in a
 * <style> tag. `countHostTrips` counts a host's public trips from the trips
 * list (the Host→Trip relationship) for ranking + the "hosted experiences"
 * line.
 */

const Shield = ({ s = 10 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2Z" /></svg>
);
const Star = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.8 6.6 20l1-6.1L3.2 9.5l6.1-.9L12 3Z" /></svg>
);
const Pin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
);
const initial = (n) => (n ? n.trim()[0]?.toUpperCase() : "N");

// Does this trip belong to this host? Matches by id or slug on either the
// populated host object or a bare host id string.
export const isTripForHost = (trip, host) => {
  if (!trip || !host) return false;
  const hostId = `${host._id || host.id || ""}`;
  const th = trip.host;
  if (!th) return false;
  if (typeof th === "string" || typeof th === "number") return `${th}` === hostId;
  if (typeof th === "object") {
    const tHostId = `${th._id || th.id || ""}`;
    return !!tHostId && tHostId === hostId;
  }
  return false;
};

// Count a host's public trips from the trips list (Host→Trip relationship).
export const countHostTrips = (host, trips) =>
  (Array.isArray(trips) ? trips : []).reduce((n, t) => n + (isTripForHost(t, host) ? 1 : 0), 0);

const HostFeatureCard = ({ c, onOpen, onExperiences }) => (
  <article className="hh2-card">
    <div className="hh2-media">
      {c.image ? <img src={c.image} alt={`${c.name} — host`} loading="lazy" /> : <span className="hh2-ph" aria-hidden="true" />}
      {c.verified && <span className="hh2-verified"><Shield />Verified Host</span>}
      <span className="hh2-rating">
        {c.rating != null ? <><Star />{c.rating.toFixed(1)}{c.reviews > 0 && <em>({c.reviews})</em>}</> : "New"}
      </span>
      <span className="hh2-avatar">{c.logo ? <img src={c.logo} alt="" /> : initial(c.name)}</span>
    </div>
    <div className="hh2-body">
      <div className="hh2-name">
        <span className="hh2-name-t">{c.name}</span>
        {c.verified && <span className="hh2-tick" title="Verified host"><Shield s={15} /></span>}
      </div>
      <div className="hh2-loc">{c.location ? <><Pin />{c.location}</> : " "}</div>
      <div className="hh2-chips">
        {c.specialties.slice(0, 3).map((s) => <span key={s} className="hh2-chip">{s}</span>)}
        {c.specialties.length > 3 && <span className="hh2-chip hh2-more">+{c.specialties.length - 3}</span>}
      </div>
      <p className="hh2-desc clamp2">{c.bio || ""}</p>
      <div className="hh2-count"><b>{c.experiences}</b> hosted experience{c.experiences === 1 ? "" : "s"}</div>
      <div className="hh2-cta">
        <button type="button" className="hh2-btn primary" onClick={() => onOpen?.(c)}>View Profile</button>
        <button type="button" className="hh2-btn secondary" onClick={(e) => onExperiences?.(e, c)}>View Experiences</button>
      </div>
    </div>
  </article>
);

export const HOST_CARD_CSS = `
  .hh2-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}
  @media(max-width:720px){.hh2-grid{grid-template-columns:1fr;max-width:440px;margin:0 auto}}
  .clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

  /* ── vertical stacked host card — compact, homepage design-system tokens ── */
  .hh2-card{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line-soft);border-radius:var(--r-lg);overflow:hidden;
    box-shadow:var(--sh);transition:box-shadow .2s ease,transform .18s ease}
  .hh2-card:hover{box-shadow:var(--sh-md);transform:translateY(-3px)}

  .hh2-media{position:relative;aspect-ratio:16/9;background:repeating-linear-gradient(135deg,var(--ink-200),var(--ink-200) 11px,var(--ink-300) 11px,var(--ink-300) 22px)}
  .hh2-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .hh2-verified{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:4px;font:700 10px/1 var(--inter);padding:4px 8px;border-radius:999px;background:var(--success);color:#fff}
  .hh2-rating{position:absolute;bottom:10px;right:10px;display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,.95);backdrop-filter:blur(6px);font:700 11.5px/1 var(--inter);color:var(--text-dark);padding:4px 9px;border-radius:999px}
  .hh2-rating em{font-style:normal;font-weight:600;color:var(--text-light);margin-left:2px;font-size:10px}
  .hh2-avatar{position:absolute;bottom:-16px;left:14px;width:44px;height:44px;border-radius:50%;border:3px solid #fff;overflow:hidden;box-shadow:var(--sh-md);
    display:grid;place-items:center;background:var(--brand-100);color:var(--orange);font:800 16px/1 var(--playfair)}
  .hh2-avatar img{width:100%;height:100%;object-fit:cover}

  .hh2-body{padding:22px 16px 14px;display:flex;flex-direction:column;flex:1}
  .hh2-name{display:flex;align-items:center;gap:6px;min-width:0;font:700 18px/1.15 var(--playfair);color:var(--text-dark);letter-spacing:-.01em}
  .hh2-name-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hh2-tick{color:var(--success);display:inline-flex;flex-shrink:0}
  .hh2-loc{display:flex;align-items:center;gap:4px;min-width:0;font:400 12.5px/1.2 var(--inter);color:var(--text-light);margin-top:6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
  .hh2-loc svg{flex-shrink:0}
  .hh2-chips{display:flex;align-items:center;flex-wrap:nowrap;gap:6px;margin-top:8px;height:26px;overflow:hidden}
  .hh2-chip{flex-shrink:0;font:700 11px/1 var(--inter);color:var(--orange);background:var(--orange-tint);padding:5px 9px;border-radius:999px;white-space:nowrap}
  .hh2-chip.hh2-more{color:var(--text-lighter);background:var(--line-soft)}
  .hh2-desc{font-family:var(--playfair);font-style:italic;font-size:13.5px;color:var(--text);line-height:1.5;margin:12px 0 0;min-height:calc(2 * 1.5 * 13.5px)}
  .hh2-count{font:400 12px/1.3 var(--inter);color:var(--text-light);margin-top:12px;padding-top:12px;border-top:1px solid var(--line-soft)}
  .hh2-count b{color:var(--text-dark);font-weight:700}
  .hh2-cta{display:flex;gap:8px;margin-top:auto;padding-top:14px}
  .hh2-btn{flex:1;height:38px;border-radius:999px;font:700 12.5px/1 var(--inter);cursor:pointer;border:1.5px solid transparent;transition:background .16s ease,transform .16s ease;white-space:nowrap}
  .hh2-btn.primary{background:var(--orange);color:#fff}
  .hh2-btn.primary:hover{background:var(--orange-hover);transform:translateY(-1px)}
  .hh2-btn.secondary{background:#fff;color:var(--orange);border-color:var(--orange)}
  .hh2-btn.secondary:hover{background:var(--orange-tint)}
`;

export default HostFeatureCard;
