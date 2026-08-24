"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Instagram embed helpers.
 *
 * Reels play via Instagram's OFFICIAL embed (blockquote + embed.js). We never
 * download, store or proxy the video — the URL is the source of truth and the
 * media loads straight from Instagram. embed.js loads once per page and the
 * embed only mounts when it's actually needed (in the lightbox), so a host
 * with many reels never hammers Instagram on page load.
 */

const EMBED_SRC = "https://www.instagram.com/embed.js";

let embedPromise = null;
export function loadEmbedScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (embedPromise) return embedPromise;
  embedPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = EMBED_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fail soft — card falls back
    document.body.appendChild(s);
  });
  return embedPromise;
}

/**
 * A single Instagram reel embed with a graceful fallback. Used inside the
 * gallery lightbox. If the reel is deleted/private/unavailable, Instagram's
 * embed can't hydrate — after a grace period we swap in a clean
 * "Video unavailable" card so the lightbox never shows a broken frame.
 */
export function ReelEmbed({ url }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadEmbedScript().then(() => {
      if (cancelled) return;
      try {
        window.instgrm?.Embeds?.process();
      } catch {
        /* noop */
      }
    });
    const t = setTimeout(() => {
      if (cancelled) return;
      if (!ref.current?.querySelector("iframe")) setFailed(true);
    }, 6000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [url]);

  if (failed) {
    return (
      <div className="hg-reel-fallback">
        <span className="hg-reel-fallback-title">Video unavailable</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="hg-reel-fallback-link">
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="hg-reel-embed" ref={ref}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ background: "#FFF", border: 0, margin: 0, width: "100%", maxWidth: "100%" }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          View reel on Instagram
        </a>
      </blockquote>
    </div>
  );
}
