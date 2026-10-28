"use client";

/*
 * Lightweight, privacy-preserving cookie-consent banner (UX-010).
 * - Accept and Decline are equally weighted — no dark pattern, nothing pre-selected.
 * - The choice is stored per browser (localStorage) and pushed to the GTM
 *   dataLayer as a Consent-Mode signal, so the GTM container can gate non-
 *   essential tags. (Actual tag gating is configured GTM-side.)
 * - Dismissing without choosing keeps the banner (no implied consent).
 */
import { useEffect, useState } from "react";

const STORAGE_KEY = "nt_cookie_consent"; // "granted" | "denied"

const pushConsent = (value) => {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "cookie_consent",
      cookie_consent: value, // "granted" | "denied"
      ad_storage: value,
      analytics_storage: value,
    });
  } catch {
    /* dataLayer unavailable — safe to ignore */
  }
};

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked (private mode) — show the banner, store nothing */
    }
    if (saved === "granted" || saved === "denied") {
      pushConsent(saved); // re-assert the prior choice for GTM this session
      return;
    }
    setVisible(true);
  }, []);

  const choose = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage blocked — choice applies for this session only */
    }
    pushConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 2000,
        maxWidth: 680,
        margin: "0 auto",
        background: "var(--surface, #FFFDF9)",
        color: "var(--ink-700, #5A5247)",
        border: "1px solid var(--ink-200, #E6DDCF)",
        borderRadius: "var(--radius-lg, 16px)",
        boxShadow: "var(--elevation-3, 0 24px 60px -20px rgba(0,0,0,.35))",
        padding: "16px 18px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
        fontFamily: "var(--inter, system-ui, sans-serif)",
      }}
    >
      <p style={{ margin: 0, flex: "1 1 280px", fontSize: 14, lineHeight: 1.55 }}>
        We use cookies to run the site and, with your consent, to understand how
        it&apos;s used. You can decline non-essential cookies.{" "}
        <a
          href="/privacy-policy"
          style={{ color: "var(--brand-600, #CF4A2C)", fontWeight: 600, textDecoration: "underline" }}
        >
          Privacy Policy
        </a>
        .
      </p>
      <div style={{ display: "flex", gap: 10, flex: "0 0 auto" }}>
        <button
          type="button"
          onClick={() => choose("denied")}
          style={{
            minHeight: 44,
            padding: "10px 18px",
            borderRadius: "var(--radius-pill, 999px)",
            border: "1.5px solid var(--ink-300, #D8CFC0)",
            background: "transparent",
            color: "var(--ink-800, #3C3228)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          style={{
            minHeight: 44,
            padding: "10px 18px",
            borderRadius: "var(--radius-pill, 999px)",
            border: "1.5px solid var(--brand-600, #CF4A2C)",
            background: "var(--brand-600, #CF4A2C)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
