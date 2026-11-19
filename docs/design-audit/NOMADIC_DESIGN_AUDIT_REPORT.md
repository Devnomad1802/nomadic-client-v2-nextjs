# Nomadic Townies — Design Audit Report

**Audit type:** Evidence-backed design/UX audit (AUDIT ONLY — no code/content changed).
**Auditor role:** Principal product designer / UX + accessibility / CRO / design-system.
**Date of review:** 2026-10-28.
**Live site:** https://www.nomadictownies.com (production).
**Method:** Live browsing in the in-app browser + source inspection of the Next.js client, Admin (Vite), and Express server repos. Screenshots captured in-session (see `SCREENSHOT_INDEX.md`). No analytics, interviews, or performance numbers were measured — none are invented below.

> Confidence legend: **Verified** = observed live or in source this session · **Probable** = strongly implied by evidence · **Needs validation** = hypothesis to measure.

---

## 1. Executive verdict

Nomadic Townies already has an **above-average, intentional visual system** for an early-stage marketplace: a coherent brand token set in code (warm ink neutrals + a single restrained orange accent), an editorial voice ("The best journeys aren't places. They're people."), real trust scaffolding (Verified / Curated / Secure / Trusted), a strong trip-detail booking card with partial-payment messaging, and a mobile sticky Book-now bar. The host-led positioning is clear and differentiated from a generic OTA.

The gaps are **not** "it looks bad" — they are: (a) a handful of **accessibility/contrast** issues on photographic heroes; (b) **information-architecture redundancy** (two parallel category systems on `/experiences`); (c) **content-polish defects** visible in production (a misspelled live category, "Bussiness & Learning"); (d) **booking-funnel transparency** — batch dates/availability are hidden until "the next step", which both hurts conversion and compounds the known Varanasi "no dates" confusion; and (e) **design-system formalization** — brand/typography tokens exist, but there is **no systematic spacing/radius/elevation scale**, so spacing and radii are applied ad hoc across components.

Net: this is a **polish-and-tighten** engagement, not a rebrand. Preserve the identity; fix accessibility and funnel clarity first.

---

## 2. What's working (strengths)

- **ST-1 — Distinct, consistent brand.** Warm "ink" neutral ramp + a single orange accent (`--brand-600 #CF4A2C`) used only for CTAs/links; bright orange (`#E9622F`) reserved for gradients/decor. Enforced via CSS variables. (Verified, source `src/app/globals.css`.)
- **ST-2 — Editorial hero voice.** Homepage + `/hosts` + `/experiences` all lead with confident Playfair/Newsreader headlines and a clear host-led value proposition. (Verified, live.)
- **ST-3 — Trust signals present and honest-looking.** Verified/Curated/Secure/Trusted rows on home, hosts, experiences; "Verified host", rating "5.0 (3)" with real count, "On-platform host support". (Verified, live.)
- **ST-4 — Strong trip-detail booking card.** "Starting from ₹34,599", strike-through original, "5% OFF", partial-payment line ("Book now for ₹10,000 — balance due 15 days before departure"), trust checks, host mini-card, in-page tab nav (Overview/Host/Itinerary/Inclusions). (Verified, live, Bhutan trip.)
- **ST-5 — Mobile booking ergonomics.** Sticky bottom Book-now bar with price on the trip detail page; large (≥44px) primary CTAs. (Verified, mobile 375px.)
- **ST-6 — Discovery filters.** `/hosts` has search + Location + Category + "Verified only"; `/experiences` has search, category chips, sort ("Upcoming first"), and month filter. (Verified, live.)

---

## 3. Findings (prioritized, with evidence)

Severity: Critical / High / Medium / Low. Each finding carries an ID, route, viewport, evidence, impact, proposed design direction, effort (S/M/L), and acceptance criteria. Proposed solutions are **design direction only — not yet implemented**.

### UX-001 — Hero sub-copy / ghost CTA contrast over photography (Accessibility)
- **Route/component:** `/` homepage hero (`HomeV3` hero), "Meet Our Hosts" ghost button; hero body paragraph.
- **Viewport:** Desktop ~800px and mobile 375px. **Confidence:** Verified (visual) / Needs validation (exact ratio).
- **Observed:** Hero body copy is light-grey text laid directly over the photograph; in the brighter sky region contrast is marginal. The "Meet Our Hosts" ghost button uses a translucent dark fill + faint border, so its white label's contrast varies with whatever photo pixels sit behind it.
- **Expected / why:** WCAG 2.2 AA requires ≥4.5:1 for body text, ≥3:1 for large text/UI boundaries, regardless of background image. Text over photos must guarantee contrast via a consistent scrim or solid chip.
- **Impact:** Accessibility blocker (legibility), trust, comprehension of the value prop above the fold.
- **Proposed:** Strengthen the hero scrim behind the text column (gradient or blurred panel) to a fixed dark value; give the secondary CTA a solid or higher-opacity fill; verify ≥4.5:1 for all hero text against the darkest allowed scrim.
- **Effort:** S. **Deps/risk:** None; purely CSS on the hero. **Accept:** All hero text + both CTAs measure ≥4.5:1 (large text ≥3:1) over the scrim at desktop/tablet/mobile; verified with a contrast tool.

### UX-002 — Two parallel category taxonomies on `/experiences` (IA)
- **Route/component:** `/experiences` hero category chips **and** the secondary category pill row.
- **Viewport:** Mobile 375px (both rows visible). **Confidence:** Verified.
- **Observed:** The hero shows chips `All / Trekking / Wellness / International / Festivals / Backpacking`; immediately below, a second pill row shows a **different** set `All / Bussiness & Learning / Trekking & … `. Two control sets, different taxonomies, same page.
- **Expected / why:** One canonical category control reduces decision cost and information-scent confusion; duplicated, non-matching taxonomies make users unsure which filter is authoritative.
- **Impact:** Comprehension, findability, perceived quality.
- **Proposed:** Consolidate to one category source (the server category list), rendered once; if both "theme chips" and "catalog categories" are intentionally different, label them distinctly ("Browse by vibe" vs "Categories") and make them visually subordinate to one primary control.
- **Effort:** M. **Deps:** Category taxonomy decision. **Accept:** A single authoritative category control; no duplicated/conflicting sets; filter state reflected in one place.

### CONTENT-003 — Misspelled live category "Bussiness & Learning" (Content/Brand polish)
- **Route/component:** `/experiences` category pill (and category pages). **Viewport:** Mobile. **Confidence:** Verified (also present in the live `getAllCategories` API).
- **Observed:** Category label reads **"Bussiness & Learning"** (should be "Business & Learning").
- **Expected / why:** Visible spelling errors erode trust and brand credibility on a trust-dependent marketplace.
- **Impact:** Trust, brand.
- **Proposed:** Correct the category name in Admin (data fix) — a content change, not code. Verify the slug/banner still resolve after rename.
- **Effort:** S (data). **Deps:** Category slug is name-derived — confirm the category page still routes after rename. **Accept:** Label reads "Business & Learning" everywhere; page + banner still load.

### UX-004 — Batch dates/availability hidden until "next step" (Conversion)
- **Route/component:** Trip detail booking card ("Select a batch date on the next step"). **Viewport:** Mobile. **Confidence:** Verified.
- **Observed:** The detail page shows price + "Book now" but **no visible departure dates/availability**; date selection only appears after clicking Book now.
- **Expected / why:** Date-led travel shoppers evaluate *when* before *whether*. Leading comparators surface available dates/slots and remaining availability on the detail page. Hiding dates adds a blind click and compounds the known Varanasi "dates unavailable" confusion (tracked separately as an engineering bug).
- **Impact:** Conversion, comprehension, trust.
- **Proposed:** Surface the next 2–4 upcoming batch dates (with "X seats left" when low) directly in/next to the pricing card, with the date picker inline; keep the full picker on the booking step.
- **Effort:** M. **Deps:** Batch data already on the trip; coordinate with the batch-availability engineering fix. **Accept:** Upcoming valid batches visible on the detail page; selecting one carries into checkout; sold-out/past states labeled.

### UX-005 — Discount authenticity must be verifiable (Trust / dark-pattern guard)
- **Route/component:** Trip detail "5% OFF" + strike-through ₹44,999 → ₹34,599. **Viewport:** Mobile. **Confidence:** Needs validation.
- **Observed:** A struck original price and "5% OFF" badge (note: 44,999→34,599 is ~23%, not 5% — the badge and the strike-through imply different discounts).
- **Expected / why:** Struck prices and discount badges must reflect a real, consistent reference price; mismatched discount figures read as a fabricated-urgency dark pattern (explicitly out of scope for this brand).
- **Impact:** Trust, legal/UX integrity.
- **Proposed:** Make the badge match the actual delta (or remove it); ensure the struck price is a genuine prior/standard price. Design: one clear discount figure, truthful.
- **Effort:** S. **Deps:** Pricing policy. **Accept:** Badge % == actual delta; struck price documented as a real reference.

### PERF-006 — Perceived-empty hero / layout shift while media loads (Performance-sensitive design)
- **Route/component:** Trip detail hero (large blank below header on first paint); homepage mid-sections showed large gaps while images lazy-loaded. **Viewport:** Mobile + ~800px. **Confidence:** Probable (observed blank regions; CLS not measured).
- **Observed:** On first navigation the trip hero rendered as a tall empty area; homepage had large empty bands mid-scroll before imagery appeared.
- **Expected / why:** Reserve space for media (aspect-ratio boxes) and show skeletons to avoid perceived-empty states and layout shift (target CLS < 0.1). Note: `<img>` is used directly (not `next/image`), so responsive sizing/lazy priority aren't automatic.
- **Impact:** Perceived performance, CLS, conversion.
- **Proposed:** Reserve hero/card aspect ratios; add skeletons; evaluate `next/image` (or explicit width/height + `fetchpriority`) for hero imagery; measure Core Web Vitals (not yet measured).
- **Effort:** M. **Deps:** Image pipeline decision. **Accept:** Measured CLS < 0.1 on home + trip detail; no perceived-empty hero at median load.

### UX-007 — Long italic serif body blocks (Readability)
- **Route/component:** `/hosts` hero subtitle (6-line italic Newsreader paragraph). **Viewport:** Mobile. **Confidence:** Verified.
- **Observed:** A long, fully-italic serif paragraph as hero support copy.
- **Expected / why:** Extended italic serif reduces reading speed on screens; reserve italic for emphasis, keep long support copy upright with comfortable measure.
- **Impact:** Comprehension, mobile readability.
- **Proposed:** Shorten to 2 lines or set upright; keep italic only on the accent phrase.
- **Effort:** S. **Accept:** Hero support copy ≤2–3 lines, upright, ≤~60-char measure.

### SYS-008 — No systematic spacing/radius/elevation tokens (Design system)
- **Scope:** Global. **Confidence:** Verified (source).
- **Observed:** `globals.css` defines brand color ramp, ink neutrals, surfaces, semantic alert colors, and font families — but **no spacing scale, radius scale, or elevation/shadow tokens**. Components use ad-hoc `--r-lg`, `--sh`, `clamp()` and raw px.
- **Expected / why:** A primitive→semantic token system (spacing, radius, elevation) is what keeps cards, buttons, inputs, and section rhythm consistent across pages and screen sizes as the catalog grows.
- **Impact:** Consistency, maintainability, future velocity.
- **Proposed:** Formalize `--space-*`, `--radius-*`, `--elevation-*` tokens (see `DESIGN_SYSTEM_PROPOSAL.md`) and migrate components incrementally.
- **Effort:** M–L (incremental). **Accept:** Documented scales; new/changed components consume tokens; no new raw px in touched components.

### A11Y-009 — `<img>` alt coverage + semantic heading order (Accessibility/SEO)
- **Scope:** Client-wide (uses raw `<img>`). **Confidence:** Needs validation (spot-checked; not exhaustively audited).
- **Observed:** Imagery uses `<img>`; some alts are descriptive (host/trip alts seen in source), but a full alt-text + H1/H2 order audit was not completed this pass.
- **Expected / why:** Every meaningful image needs alt; decorative images `alt=""`; one H1 per page; logical H2/H3 order for screen readers + SEO.
- **Impact:** Accessibility, SEO.
- **Proposed:** Full alt + heading-order pass per template (Phase 7 verification).
- **Effort:** M. **Accept:** 100% meaningful-image alt coverage; valid heading outline per page.

### UX-010 — No visible cookie/consent & nav affordance review (Compliance/Nav)
- **Scope:** Global header; consent. **Confidence:** Probable.
- **Observed:** No cookie/consent UI observed (GetYourGuide shows GDPR consent); header collapses to a hamburger at ~800px (fine for tablet/mobile, but confirm the full desktop nav exposes primary destinations rather than hiding them behind the menu at wide widths).
- **Expected / why:** If EU/analytics cookies are used, a consent mechanism is expected; primary nav destinations should be directly reachable on desktop.
- **Impact:** Compliance (needs validation), findability.
- **Proposed:** Confirm cookie usage + add consent if required; verify desktop nav exposes Experiences/Hosts/Blog directly.
- **Effort:** S–M. **Accept:** Consent present if cookies warrant; desktop nav exposes top destinations.

---

## 4. Page-by-page critique (summary)

| Route | Strengths (Verified) | Key issues |
|---|---|---|
| `/` Homepage | Editorial hero, dual CTA, trust row, host highlight (real host, rating+count) | UX-001 hero contrast; PERF-006 lazy gaps |
| `/experiences` | Search, category chips, sort, month filter, trust row | UX-002 dual taxonomy; CONTENT-003 typo |
| trip detail (`/trips/.../...`) | Pricing card, partial pay, trust checks, tab nav, sticky mobile CTA | UX-004 hidden dates; UX-005 discount mismatch; PERF-006 empty hero |
| `/hosts` | Editorial hero, search+filters+verified toggle, trust row, shared host card | UX-007 long italic block |
| Host detail | Shared `HostFeatureCard`; hero title alignment recently fixed | (verify long-name wrapping across hosts — recently addressed) |
| Category pages | Page banner now resolves for multi-word categories (recent fix) | CONTENT-003 typo category |
| Admin | Covered as separate workstream (Phase 6) — form drafts, field-level errors, readable inputs recently added | Broader form/table consistency pass pending |

---

## 5. Brand analysis (grounded in source)

- **Logo:** Wordmark "nomadic townies" in a custom rounded display face; "nomadic" set in the brand orange, "townies" in near-black ink. Favicon `favicon.ico`; org schema references `/nt.png`. (Verified, live + source.) **The logo pixels were not color-sampled this pass** — recommend sampling the source SVG/PNG to confirm the exact orange matches `--brand-600 #CF4A2C` (the token used for the "nomadic" wordmark on-site appears consistent, Needs validation at pixel level).
- **Primary accent:** `--brand-600 #CF4A2C` (CTAs, links, active); hover `--brand-700 #B83F23`; bright `--brand-500 #E9622F` (decor/gradients only). Restrained single-accent usage — good.
- **Neutrals:** warm "ink" ramp `#221C17 → #F4EEE4`; surfaces `#FFFDF9 / #FBF6EE`. Warm, on-brand, not cold grey.
- **Type:** Inter (UI/sans), Playfair + Playfair Display (display serif), Newsreader (editorial serif), ZingScript (local decorative). Clear sans/serif duality supports the editorial voice.

Full token table + proposals: `DESIGN_SYSTEM_PROPOSAL.md`.

---

## 6. Accessibility review (WCAG 2.2 AA) — partial

- **Contrast:** Hero text/ghost CTA over photos is the main risk (UX-001). Semantic alert colors defined but not pair-checked.
- **Keyboard/focus:** Not fully exercised this pass (Needs validation) — verify visible focus rings aren't suppressed and modals trap focus.
- **Alt text / headings:** A11Y-009 — needs a full pass.
- **Touch targets:** Primary CTAs ≥44px (Verified); verify chip/pill rows and icon-only controls meet 44×44 + 8px spacing.
- **Reduced motion:** Carousel/scroll motion present — verify `prefers-reduced-motion` support (Needs validation).

A dedicated accessibility verification is scoped in Phase 7.

---

## 7. Responsive review

- **Mobile (375px):** Hero, hosts, experiences, trip detail all reflow cleanly; sticky mobile Book-now bar works; no horizontal overflow observed on the pages tested. (Verified.)
- **Tablet (~800px):** Header collapses to hamburger; hero legible. (Verified.)
- **Desktop (wide):** Not captured at full desktop width this pass (pane width limits) — recommend a true ≥1280px capture pass (see Unknowns).

---

## 8. Unknowns / access limitations / tests still needed

- Full **desktop ≥1280px** screenshots (pane limited to ~800px this session).
- **Core Web Vitals / Lighthouse** — not measured; no numbers invented.
- **Keyboard/focus, reduced-motion, full alt/heading** audits — partial.
- **Pixel-level logo color sampling** — recommended to confirm `#CF4A2C` against the source asset.
- **Competitors** beyond GetYourGuide — not reviewed live this pass (see `COMPETITOR_BENCHMARK.md`; others listed as references, not claimed as audited).
- Discount authenticity (UX-005) — needs the real pricing policy.

---

*No code, styles, content, or data were modified. This document is a proposal/audit only.*
