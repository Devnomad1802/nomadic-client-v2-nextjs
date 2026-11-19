# Screenshot Index — Nomadic Townies Design Audit

Captured in the in-app browser during the audit session on **2026-10-28**. These are **session captures** (held in the tool-result store, not committed as binaries to the repo — committing large images is avoided unless you want them in-tree). Each row lists route, viewport, what it evidences, and the finding IDs it supports. **No screenshots were invented.**

| # | Route | Viewport | Captured | Shows | Findings |
|---|---|---|---|---|---|
| 1 | `/` (homepage hero) | ~800×600 (tablet) | 2026-10-28 | Hero headline + dual CTA + trust row; wordmark logo (orange "nomadic" + ink "townies") | ST-1, ST-2, ST-3, UX-001 |
| 2 | `/` (mid-scroll) | ~800×600 | 2026-10-28 | Sticky header; large empty band + floating "5.0 (3)"/"New" while media lazy-loads | PERF-006 |
| 3 | `/` (host highlight, text) | ~800×600 | 2026-10-28 | "People behind it" host card — real host "Ricky Mountaineer", rating 5.0 (3), 2 hosted experiences, View Profile/Experiences | ST-3 |
| 4 | `/` (homepage hero) | 375×812 (mobile) | 2026-10-28 | Mobile hero; readable headline; **low-contrast translucent "Meet Our Hosts" ghost CTA** over photo | UX-001 |
| 5 | `/hosts` | 375×812 | 2026-10-28 | Editorial hero + search + Location/Category filters + "Verified only" toggle + trust row | ST-6, UX-007 |
| 6 | `/experiences` | 375×812 | 2026-10-28 | Search-led hero; category chips (Trekking/Wellness/International/Festivals/Backpacking); **second category pill row incl. "Bussiness & Learning"**; sort + month filter | UX-002, CONTENT-003, ST-6 |
| 7 | `/trips/bhutan/explore-bhutan-magic-7-day-tour` | 375×812 | 2026-10-28 | Trip detail on first paint — tall blank hero while images load | PERF-006 |
| 8 | same trip (booking area) | 375×812 | 2026-10-28 | Pricing card ("Starting from ₹34,599", strike ₹44,999, "5% OFF"), Book now, partial-pay line, "Select a batch date on the next step", trust checks, host mini-card, **mobile sticky Book-now bar** | ST-4, ST-5, UX-004, UX-005 |
| 9 | GetYourGuide `https://www.getyourguide.com` | 375×812 | 2026-10-28 | Competitor: **search-first hero** "Experiences worth travelling for" + Top destinations rail; GDPR consent modal | Benchmark (COMPETITOR_BENCHMARK.md) |

## Coverage gaps (recommended additional captures)
- True **desktop ≥1280px** of home / experiences / trip detail / hosts (pane limited to ~800px this session).
- Category landing page (banner render) across multiple multi-word categories.
- Host **detail** page (title alignment across short/long names).
- Booking **next step** (batch date picker, traveller form, coupon, payment, success/failure) — for Phase 3.
- Loading/empty/error states (no-batch, failed payment).
- Remaining competitors (Airbnb Experiences, Klook, Thrillophilia) for the benchmark matrix.

> To persist any of these as files in the repo for handoff, say so and I can save selected captures under `docs/design-audit/screenshots/` with these same IDs.
