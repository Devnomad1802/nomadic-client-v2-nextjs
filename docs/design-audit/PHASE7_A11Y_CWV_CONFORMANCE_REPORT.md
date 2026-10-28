# Phase 7 — Accessibility (WCAG 2.2 AA) & Core Web Vitals Conformance Report

**Site:** Nomadic Townies client (Next.js). **Date:** 2026-10-29.
**Method:** axe-core 4.10.2 automated scan (tags: wcag2a, wcag2aa, wcag21a, wcag21aa) + browser `PerformanceObserver` CWV, run against a local **dev** build on `localhost`.
**Scope scanned:** `/` (home), `/experiences`, `/hosts`.

> **This is a measurement/verification deliverable — no app code was changed in Phase 7.** Findings below are a prioritized remediation backlog for a follow-up gated phase.

---

## 1. Honest caveats (read first)

- **Automated ≠ complete.** axe-core catches ~30–50% of WCAG issues. It does **not** verify keyboard operability, focus order, screen-reader meaning, or content sense. Those need manual + assistive-tech testing (not done here) before claiming full AA conformance.
- **CWV numbers are DEV-build, localhost — indicative only, not production.** A dev build ships unminified JS with HMR and no CDN/caching, which inflates LCP/TTFB. Treat the production figures as better than these. Real CWV must come from field data (e.g. Vercel Analytics / CrUX).
- Counts are per-page node counts from one render; dynamic content (trip/host lists) scales some counts.

---

## 2. Scorecard

| Check | Home `/` | `/experiences` | `/hosts` | Verdict |
|---|---|---|---|---|
| **Critical violations** | 2 | 2 | 2 | ❌ Fix required |
| color-contrast (serious) nodes | 68 | 46 | 39 | ❌ Systemic |
| Images missing `alt` attr | — | — | 0 / 23 | ✅ Pass |
| `<h1>` per page | 1 | — | **2** | ⚠️ `/hosts` has two |
| CLS (dev) | **0** | — | — | ✅ Good |
| Reduced-motion honored | ✅ (Phase 5) | ✅ | ✅ | ✅ |
| Visible focus ring (`:focus-visible`) | ✅ (Phase 0) | ✅ | ✅ | ✅ |

---

## 3. Critical violations (WCAG 2a — must fix)

| # | Rule | Where | Detail | Fix |
|---|---|---|---|---|
| C1 | `button-name` | **Navbar icon button** (`.MuiIconButton` — appears on every page) | Icon-only button with no discernible text/label | Add `aria-label` (e.g. "Open menu") to the IconButton |
| C2 | `select-name` | `/experiences` `.ap-sort` (1); `/hosts` filter selects (2) | `<select>` controls with no accessible name | Add `aria-label` or an associated `<label>` to each select |
| C3 | `aria-required-children` | Home `.cats-marquee` | `role="list"` whose direct children aren't `role="listitem"` (duplicated marquee track breaks the list) | Give items `role="listitem"`, or drop `role="list"`/`aria-label` from the marquee |

C1 is one shared component → a single fix clears it on **every** page.

---

## 4. Color contrast (serious — WCAG 1.4.3, systemic)

The brand primary `--brand-600 #CF4A2C` as **text** on light surfaces lands just under the 4.5:1 AA threshold, and `--brand-500 #E9622F` fails clearly when used behind white text. Representative buckets (home):

| Foreground / background | Ratio | Need | ~Nodes | Notes |
|---|---|---|---|---|
| `#CF4A2C` on `#FFFFFF` | **4.49** | 4.5 | 16 | Fails by 0.01 — brand labels/links |
| `#CF4A2C` on `#FDF3EE` | 4.11 | 4.5 | 14 | Brand text on tint |
| `#CF4A2C` on `#FBF6EE` | 4.18 | 4.5 | 6 | Brand text on soft surface |
| `#FFFFFF` on `#CF4A2C` | 4.49 | 4.5 | 6 | Primary buttons (borderline) |
| **`#FFFFFF` on `#E9622F`** | **3.35** | 4.5 | 3 | `.btn-xl` — brand-500 as a button bg (globals.css says brand-500 is "decor only, never text") |
| `#FBF1EE` on `#CF4A2C` | 4.05 | 4.5 | 6 | Marquee tag text |
| `#8A8073` (ink-500) on light | 3.24–3.87 | 4.5 | ~7 | Muted meta text |
| `#726A5E` / `#5A5247` on `#1A1A1A` | 3.26 / **2.26** | 4.5 | 2 | Footer muted text on dark |

**Root cause:** the brand ramp was tuned for UI presence, not AA text contrast. A targeted token nudge fixes it broadly:
- Define an **accessible brand-for-text** value (darken `#CF4A2C` — e.g. toward `--brand-700 #B83F23` or deeper — until it measures ≥4.5:1 on both `#FFFFFF` and `#FBF6EE` in a contrast checker), use it for text/links/labels while keeping `#CF4A2C` for large decor.
- Never put white text on `--brand-500 #E9622F`; use `--brand-600`/`700` for button fills.
- Lift footer muted text (`#726A5E`/`#5A5247` on `#1A1A1A`) to a lighter ink that clears 4.5:1.

Because these are tokens, most of the 39–68 nodes/page resolve from a handful of value changes.

---

## 5. Core Web Vitals baseline (DEV — indicative)

Home `/`, localhost dev build:

| Metric | Value | Good threshold | Note |
|---|---|---|---|
| LCP | 2176 ms | < 2500 ms | Dev-inflated; prod expected lower |
| CLS | **0** | < 0.1 | ✅ Token/reserved-space work paying off |
| FCP | 2176 ms | < 1800 ms | Dev-inflated |
| TTFB | 709 ms | < 800 ms | Dev server, not CDN |
| DOMContentLoaded | 1346 ms | — | — |

CLS = 0 is a genuine positive. **Action:** stand up production field CWV (Vercel Speed Insights / CrUX) for authoritative numbers before any perf work.

---

## 6. Prioritized remediation backlog

1. **P0 — Criticals (C1–C3).** Small, safe: 1 navbar `aria-label`, 3 select labels, 1 marquee role fix. Clears all WCAG 2a criticals site-wide.
2. **P1 — Brand text-contrast tokens.** Introduce an AA-safe brand-text token + fix `.btn-xl` and footer muted text. Resolves the bulk of the serious contrast nodes.
3. **P2 — Structure.** `/hosts` second `<h1>` → demote to `<h2>` (one h1 per page, WCAG 1.3.1).
4. **P3 — Manual pass (not automatable).** Keyboard-only walkthrough of the booking funnel, focus order, screen-reader labels, and real production CWV field data.

---

## 7. What's already conformant (verified)

- Visible keyboard focus everywhere (`:focus-visible`, Phase 0).
- `prefers-reduced-motion` respected globally (Phase 5 — CSS guard + framer `MotionConfig`).
- All images on `/hosts` carry `alt` attributes.
- CLS = 0 on home (dev).

---

*Report generated from live axe-core + PerformanceObserver runs; all ratios/counts above are measured, not estimated. CWV figures are dev-build and must be re-measured in production.*
