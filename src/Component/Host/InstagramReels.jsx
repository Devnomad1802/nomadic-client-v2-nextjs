"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Instagram Reels gallery.
 *
 * Renders public Instagram reels via Instagram's OFFICIAL embed (blockquote +
 * embed.js). We never download, store or proxy the video — the URL is the
 * source of truth and the media is loaded straight from Instagram.
 *
 * Performance: embed.js loads once (shared), and each reel only mounts its
 * blockquote when it scrolls near the viewport (IntersectionObserver), so a
 * host with many reels doesn't hammer Instagram on page load.
 *
 * Fallback: if a reel is deleted/private/unavailable, Instagram's own embed
 * can't hydrate — after a grace period we swap in a clean "Video unavailable"
 * card with a link, so one bad reel never breaks the gallery.
 */

const EMBED_SRC = "https://www.instagram.com/embed.js";

// Load embed.js once per page and re-run the parser. Returns nothing; safe to
// call repeatedly (Instagram's Embeds.process is idempotent per blockquote).
let embedPromise = null;
function loadEmbedScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (embedPromise) return embedPromise;
  embedPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = EMBED_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fail soft — cards fall back individually
    document.body.appendChild(s);
  });
  return embedPromise;
}

function ReelCard({ url, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  // Mount the embed only when the card nears the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // Once visible, ensure the script is loaded and ask Instagram to hydrate.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    loadEmbedScript().then(() => {
      if (cancelled) return;
      try {
        window.instgrm?.Embeds?.process();
      } catch {
        /* noop */
      }
    });
    // Grace period: if Instagram never replaces the blockquote with its iframe
    // (deleted / private / unavailable reel), show the fallback card.
    const t = setTimeout(() => {
      if (cancelled) return;
      const hasIframe = ref.current?.querySelector("iframe");
      if (!hasIframe) setFailed(true);
    }, 6000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [visible]);

  if (failed) {
    return (
      <div className="hd-reel hd-reel-fallback">
        <div className="hd-reel-fallback-inner">
          <span className="hd-reel-fallback-title">Video unavailable</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="hd-reel-fallback-link">
            View on Instagram
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="hd-reel" ref={ref}>
      {visible ? (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ background: "#FFF", border: 0, margin: 0, width: "100%" }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            View reel {index + 1} on Instagram
          </a>
        </blockquote>
      ) : (
        <div className="hd-reel-skeleton" aria-hidden="true" />
      )}
    </div>
  );
}

export default function InstagramReels({ reels = [] }) {
  if (!reels.length) return null;
  return (
    <div className="hd-reels-wrap">
      <div className="hd-reels-grid">
        {reels.map((url, i) => (
          <ReelCard key={url} url={url} index={i} />
        ))}
      </div>
    </div>
  );
}
