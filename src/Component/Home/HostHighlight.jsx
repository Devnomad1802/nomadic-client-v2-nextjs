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
import { toCard } from "../Host/HostListingCard";

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
      {/* location + primary category on one fixed-height row (consistent across
          cards); location truncates so the chip position never drifts. */}
      <div className="hh2-meta">
        <span className="hh2-loc">{c.location ? <><Pin />{c.location}</> : null}</span>
        {c.specialties[0] && <span className="hh2-chip">{c.specialties[0]}</span>}
        {c.specialties.length > 1 && <span className="hh2-chip hh2-more">+{c.specialties.length - 1}</span>}
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

const HostHighlight = ({ hosts }) => {
  const navigate = useNavigate();
  const { data } = useGetAllHostsQuery(undefined, { skip: Array.isArray(hosts) });

  const list = useMemo(() => {
    const src = Array.isArray(hosts) ? hosts : (data?.data || data || []);
    return (Array.isArray(src) ? src : [])
      .filter((h) => h && h.showOnWebsite !== false)
      .sort((a, b) => (b?.isVerified ? 1 : 0) - (a?.isVerified ? 1 : 0))
      .slice(0, 4)
      .map(toCard);
  }, [hosts, data]);

  if (list.length === 0) return null;

  return (
    <section className="section" style={{ background: "#fff" }}>
      <style>{CSS}</style>
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

/* Card styled to the homepage design system: shared tokens (--r-lg, --sh,
   --line-soft, --orange, --success, ink/text scale) so it reads as a native
   .why-card sibling. margin-top:auto on the CTA row pins buttons to a common
   baseline → uniform card heights across the row. */
const CSS = `
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
  /* location + primary chip on one fixed-height line; location shrinks/ellipsis
     so the chip sits at the same x/y on every card */
  .hh2-meta{display:flex;align-items:center;gap:8px;margin-top:6px;min-height:24px}
  .hh2-loc{flex:1;min-width:0;display:inline-flex;align-items:center;gap:4px;font:400 12.5px/1.2 var(--inter);color:var(--text-light);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
  .hh2-loc svg{flex-shrink:0}
  .hh2-chip{flex-shrink:0;font:700 11px/1 var(--inter);color:var(--orange);background:var(--orange-tint);padding:5px 9px;border-radius:999px;white-space:nowrap}
  .hh2-chip.hh2-more{color:var(--text-lighter);background:var(--line-soft)}
  /* reserve exactly two lines so short + long bios keep the same rhythm */
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

export default HostHighlight;
