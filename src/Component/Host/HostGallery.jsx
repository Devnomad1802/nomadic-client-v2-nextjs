"use client";

import { useEffect, useMemo, useState } from "react";
import { ReelEmbed } from "./InstagramReels";

/**
 * Host gallery — Design 1B ("reels rail + photo grid").
 *
 * Filter tabs (All / Photos / Reels) over a horizontal 9:16 reels rail and a
 * clean 3-column photo grid. Photos come from the host's `gallery`; reels are
 * public Instagram URLs. Reels play through Instagram's official embed inside
 * the lightbox (no download / store / proxy). The whole thing reuses the host
 * page design tokens (--head/--body/--ink/--line/--accent), so it sits inside
 * the existing page without importing any new fonts or colors.
 */

const IcReel = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="m10 8 6 4-6 4V8Z" fill={color} stroke="none" />
  </svg>
);

const IcPhoto = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 18 5-4 4 3 3-3 4 3" />
  </svg>
);

export default function HostGallery({ photos = [], reels = [], firstName = "the host" }) {
  const photoItems = useMemo(
    () => photos.filter(Boolean).map((src, i) => ({ type: "photo", src, i })),
    [photos]
  );
  const reelItems = useMemo(
    () => reels.filter(Boolean).map((url, i) => ({ type: "reel", url, i })),
    [reels]
  );

  const hasPhotos = photoItems.length > 0;
  const hasReels = reelItems.length > 0;

  const [filter, setFilter] = useState("all"); // all | photos | reels
  // group: the array currently shown in the lightbox; idx: position within it.
  const [lb, setLb] = useState(null); // { group: [...], idx }

  const showRail = hasReels && (filter === "all" || filter === "reels");
  const showGrid = hasPhotos && (filter === "all" || filter === "photos");

  const openLb = (group, idx) => setLb({ group, idx });
  const closeLb = () => setLb(null);
  const lbPrev = () =>
    setLb((s) => (s ? { ...s, idx: (s.idx - 1 + s.group.length) % s.group.length } : s));
  const lbNext = () =>
    setLb((s) => (s ? { ...s, idx: (s.idx + 1) % s.group.length } : s));

  useEffect(() => {
    if (!lb) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") lbPrev();
      if (e.key === "ArrowRight") lbNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb]);

  if (!hasPhotos && !hasReels) return null;

  const tabs = [
    ["all", "All", photoItems.length + reelItems.length],
    ["photos", "Photos", photoItems.length],
    ["reels", "Reels", reelItems.length],
  ].filter(([, , n]) => n > 0);

  const current = lb ? lb.group[lb.idx] : null;

  return (
    <section className="hg-card">
      <h2 className="hg-title">From {firstName}&apos;s trips</h2>
      <p className="hg-sub">Real moments and reels from past experiences.</p>

      {tabs.length > 1 && (
        <div className="hg-tabs">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              className={`hg-tab ${filter === key ? "is-active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="hg-tab-count">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* reels rail */}
      {showRail && (
        <>
          <div className="hg-strip-head">
            <IcReel color="var(--accent)" />
            <span className="hg-strip-label">Reels</span>
            <span className="hg-strip-note">· swipe</span>
          </div>
          <div className="hg-scroll">
            {reelItems.map((item, i) => (
              <button
                key={item.url}
                type="button"
                className="hg-reel-tile"
                onClick={() => openLb(reelItems, i)}
                aria-label={`Play reel ${i + 1} of ${reelItems.length}`}
              >
                <span className="hg-reel-anim" />
                <span className="hg-badge hg-badge-tl">9:16</span>
                <span className="hg-play">
                  <IcReel size={18} color="#fff" />
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* photo grid */}
      {showGrid && (
        <>
          {showRail && (
            <div className="hg-strip-head hg-strip-head--photos">
              <IcPhoto color="var(--muted)" />
              <span className="hg-strip-label">Photos</span>
            </div>
          )}
          <div className="hg-grid">
            {photoItems.map((item, i) => (
              <button
                key={i}
                type="button"
                className="hg-photo-tile"
                onClick={() => openLb(photoItems, i)}
                aria-label={`View photo ${i + 1} of ${photoItems.length}`}
              >
                <img src={item.src} alt={`${firstName} trip ${i + 1}`} loading="lazy" />
                <span className="hg-badge hg-badge-tl">Photo</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* lightbox */}
      {current && (
        <div className="hg-lb" onClick={closeLb} role="dialog" aria-modal="true">
          <button type="button" className="hg-lb-close" onClick={closeLb} aria-label="Close">
            ✕
          </button>
          {lb.group.length > 1 && (
            <button
              type="button"
              className="hg-lb-nav hg-lb-prev"
              onClick={(e) => { e.stopPropagation(); lbPrev(); }}
              aria-label="Previous"
            >
              ‹
            </button>
          )}
          <figure className="hg-lb-fig" onClick={(e) => e.stopPropagation()}>
            {current.type === "reel" ? (
              <div className="hg-lb-reel">
                <ReelEmbed key={current.url} url={current.url} />
              </div>
            ) : (
              <div className="hg-lb-photo">
                <img src={current.src} alt={`${firstName} trip`} />
              </div>
            )}
            <figcaption className="hg-lb-pos">
              {current.type === "reel" ? "Reel" : "Photo"} {lb.idx + 1} / {lb.group.length}
            </figcaption>
          </figure>
          {lb.group.length > 1 && (
            <button
              type="button"
              className="hg-lb-nav hg-lb-next"
              onClick={(e) => { e.stopPropagation(); lbNext(); }}
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>
      )}
    </section>
  );
}
