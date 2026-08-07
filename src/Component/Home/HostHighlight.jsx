"use client";

/* eslint-disable react/prop-types */
/**
 * HostHighlight — homepage "featured hosts" section. Uses a COMPACT host card
 * (this section only) so it reads as a premium featured strip, not a big
 * promotional block. The full Meet-Our-Hosts card (HostListingCard) is left
 * untouched. Data comes from the same live hosts query; `toCard` maps the shape.
 * Degrades to nothing when no hosts are available (no fabricated content).
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetAllHostsQuery } from "../../services";
import { toCard } from "../Host/HostListingCard";

const Shield = ({ s = 11 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2Z" /></svg>
);
const Star = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.8 6.6 20l1-6.1L3.2 9.5l6.1-.9L12 3Z" /></svg>
);
const Pin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
);
const initial = (n) => (n ? n.trim()[0]?.toUpperCase() : "N");

const HostMiniCard = ({ c, onOpen, onExperiences }) => {
  const tagline = c.raw?.tagline || c.raw?.hostTitle || "";
  return (
    <article className="hh-card">
      <div className="hh-cover">
        {c.image ? <img src={c.image} alt={`${c.name} — host`} loading="lazy" /> : <div className="hh-cover-ph" />}
        {c.verified && <span className="hh-vbadge"><Shield />Verified</span>}
        <span className="hh-rating">{c.rating != null ? <><Star />{c.rating.toFixed(1)}{c.reviews > 0 && <em>({c.reviews})</em>}</> : "New"}</span>
        <span className="hh-avatar">{c.logo ? <img src={c.logo} alt={c.name} /> : initial(c.name)}</span>
      </div>
      <div className="hh-body">
        <div className="hh-name">{c.name}{c.verified && <span className="hh-tick" title="Verified host"><Shield s={13} /></span>}</div>
        {c.location && <div className="hh-loc"><Pin />{c.location}</div>}
        {tagline && <div className="hh-tag">{tagline}</div>}
        {c.specialties.length > 0 && (
          <div className="hh-chips">
            {c.specialties.slice(0, 3).map((s) => <span key={s} className="hh-chip">{s}</span>)}
            {c.specialties.length > 3 && <span className="hh-chip hh-more">+{c.specialties.length - 3}</span>}
          </div>
        )}
        {c.bio && <p className="hh-bio">{c.bio}</p>}
        <div className="hh-foot">
          <span className="hh-exp"><b>{c.experiences}</b> experience{c.experiences === 1 ? "" : "s"}</span>
          <div className="hh-cta">
            <button type="button" className="hh-btn ghost" onClick={(e) => { e.stopPropagation(); onExperiences?.(e, c); }}>Experiences</button>
            <button type="button" className="hh-btn primary" onClick={(e) => { e.stopPropagation(); onOpen?.(c); }}>View profile</button>
          </div>
        </div>
      </div>
    </article>
  );
};

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
              A great host changes everything — the trail nobody photographs, the family who&apos;ll
              cook for you, the moment the light hits the valley. Meet a few of ours.
            </p>
          </div>
          <button className="btn btn-ghost btn-md" onClick={() => navigate("/hosts")}>
            Meet all our hosts <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </button>
        </div>
        <div className="hh-grid">
          {list.map((c) => (
            <HostMiniCard
              key={c.id}
              c={c}
              onOpen={(cc) => { navigate(`/hosts/${cc.seoSlug || cc.id}`); window.scrollTo(0, 0); }}
              onExperiences={(e, cc) => { navigate(`/hosts/${cc.seoSlug || cc.id}?tab=experiences`); window.scrollTo(0, 0); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const CSS = `
  .hh-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  @media(max-width:1024px){.hh-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:760px){.hh-grid{grid-template-columns:repeat(2,1fr);gap:16px}}
  @media(max-width:480px){.hh-grid{grid-template-columns:1fr}}
  .hh-card{display:flex;flex-direction:column;background:#fff;border:1px solid #ECE6DD;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(28,26,23,.04);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
  .hh-card:hover{transform:translateY(-3px);box-shadow:0 12px 26px -14px rgba(28,26,23,.28);border-color:#E0D7C9}
  .hh-cover{position:relative;aspect-ratio:16/10;background:#EFE7DA;overflow:hidden}
  .hh-cover img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}
  .hh-card:hover .hh-cover img{transform:scale(1.04)}
  .hh-cover-ph{position:absolute;inset:0;background:linear-gradient(135deg,#F3E3DA,#E8D2C4)}
  .hh-vbadge{position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;gap:4px;font:700 9.5px/1 'Hanken Grotesk',sans-serif;color:#fff;background:rgba(46,125,79,.92);padding:4px 8px;border-radius:99px;backdrop-filter:blur(2px)}
  .hh-rating{position:absolute;top:9px;right:9px;display:inline-flex;align-items:center;gap:4px;font:700 11px/1 'Hanken Grotesk',sans-serif;color:#221C17;background:rgba(255,255,255,.94);padding:4px 8px;border-radius:99px;box-shadow:0 1px 3px rgba(0,0,0,.14)}
  .hh-rating svg{color:#E9A21B}
  .hh-rating em{font-style:normal;color:#8A8073;font-weight:600;font-size:10px}
  .hh-avatar{position:absolute;left:12px;bottom:-16px;width:40px;height:40px;border-radius:12px;border:2.5px solid #fff;background:#F6E4DC;color:#CF4A2C;display:grid;place-items:center;overflow:hidden;font:800 15px/1 'Hanken Grotesk',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.14)}
  .hh-avatar img{width:100%;height:100%;object-fit:cover}
  .hh-body{padding:22px 14px 14px;display:flex;flex-direction:column;gap:6px}
  .hh-name{display:flex;align-items:center;gap:6px;font:750 15px/1.2 'Hanken Grotesk',sans-serif;color:#1C1A17;letter-spacing:-.01em}
  .hh-tick{color:#CF4A2C;display:inline-flex}
  .hh-loc{display:flex;align-items:center;gap:5px;font:500 12px/1.2 'Hanken Grotesk',sans-serif;color:#8A8073}
  .hh-tag{font:500 12.5px/1.4 'Hanken Grotesk',sans-serif;color:#5A544B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hh-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
  .hh-chip{font:600 10.5px/1 'Hanken Grotesk',sans-serif;color:#A23A26;background:#F7EBE5;border-radius:99px;padding:5px 8px}
  .hh-chip.hh-more{color:#8A8073;background:#F1ECE3}
  .hh-bio{margin:2px 0 0;font:400 12.5px/1.5 'Hanken Grotesk',sans-serif;color:#6E6A63;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .hh-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;padding-top:12px;border-top:1px solid #F1ECE3}
  .hh-exp{font:500 11.5px/1.2 'Hanken Grotesk',sans-serif;color:#8A8073;white-space:nowrap}
  .hh-exp b{color:#1C1A17;font-weight:800}
  .hh-cta{display:flex;gap:6px}
  .hh-btn{font:700 11.5px/1 'Hanken Grotesk',sans-serif;border-radius:9px;padding:8px 11px;cursor:pointer;border:1px solid transparent;white-space:nowrap;transition:background .15s,border-color .15s}
  .hh-btn.ghost{background:transparent;border-color:#E0D7C9;color:#5A544B}
  .hh-btn.ghost:hover{border-color:#CF4A2C;color:#CF4A2C}
  .hh-btn.primary{background:#CF4A2C;color:#fff}
  .hh-btn.primary:hover{background:#C0421F}
  @media(max-width:760px){.hh-cta .ghost{display:none}}
`;

export default HostHighlight;
