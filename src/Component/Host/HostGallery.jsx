"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Host gallery — Design 1B ("reels rail + photo grid").
 *
 * Reels are short 9:16 videos the host owns, served from our own CDN. They
 * autoplay muted + looped + playsinline while on screen and pause when they
 * scroll out of view (IntersectionObserver) — native <video>, no Instagram
 * player, no redirect, no profile chrome. Photos come from `host.gallery`.
 * Everything reuses the host page design tokens.
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

const IcMuted = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m17 9 4 6M21 9l-4 6" />
  </svg>
);

const IcSound = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 8a5 5 0 0 1 0 8" />
  </svg>
);

/**
 * A single rail reel: native <video> that autoplays muted only while visible,
 * pauses off-screen (saves bandwidth/CPU), and falls back cleanly if the video
 * can't load. The tile is a button that opens the lightbox — the video itself
 * never navigates away.
 */
function ReelVideo({ reel, muted, onOpen, label }) {
  const wrapRef = useRef(null);
  const vidRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    const vid = vidRef.current;
    if (!el || !vid) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            vid.play?.().catch(() => {});
          } else {
            vid.pause?.();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (failed) {
    return (
      <div className="hg-reel-tile hg-reel-tile--fallback">
        <span className="hg-reel-fallback-title">Video unavailable</span>
      </div>
    );
  }

  return (
    <button type="button" className="hg-reel-tile" onClick={onOpen} aria-label={label} ref={wrapRef}>
      <video
        ref={vidRef}
        className="hg-reel-video"
        src={reel.videoUrl}
        poster={reel.poster || undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      />
      <span className="hg-badge hg-badge-tl">9:16</span>
    </button>
  );
}

export default function HostGallery({ photos = [], reels = [], firstName = "the host" }) {
  const photoItems = useMemo(
    () => photos.filter(Boolean).map((src, i) => ({ type: "photo", src, i })),
    [photos]
  );
  const reelItems = useMemo(
    () => reels.filter((r) => r && r.videoUrl).map((r, i) => ({ type: "reel", ...r, i })),
    [reels]
  );

  const hasPhotos = photoItems.length > 0;
  const hasReels = reelItems.length > 0;

  const [filter, setFilter] = useState("all"); // all | photos | reels
  const [muted, setMuted] = useState(true);
  const [lb, setLb] = useState(null); // { group, idx }

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

      {(tabs.length > 1 || hasReels) && (
        <div className="hg-toolbar">
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
          {hasReels && (
            <button type="button" className="hg-mute" onClick={() => setMuted((m) => !m)}>
              {muted ? <IcMuted /> : <IcSound />}
              {muted ? "Muted" : "Sound on"}
            </button>
          )}
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
              <ReelVideo
                key={item.videoUrl}
                reel={item}
                muted={muted}
                onOpen={() => openLb(reelItems, i)}
                label={`Open reel ${i + 1} of ${reelItems.length}`}
              />
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
                <video
                  key={current.videoUrl}
                  src={current.videoUrl}
                  poster={current.poster || undefined}
                  autoPlay
                  loop
                  playsInline
                  controls
                  muted={muted}
                />
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
