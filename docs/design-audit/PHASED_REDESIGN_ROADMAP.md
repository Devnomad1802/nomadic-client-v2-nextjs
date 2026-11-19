# Phased Redesign Roadmap — Nomadic Townies

**Status:** PROPOSAL. No implementation until you approve a phase. Scoring and sequencing below are recommendations based on this audit's evidence.

## Prioritization model

**Priority score = (Impact × Confidence) ÷ Effort**, each 1–5 (Effort: 1 = XS … 5 = XL).
**Overrides (jump to top regardless of score):** accessibility blockers and anything touching the live booking funnel. Functional bugs (Varanasi batch availability, Razorpay) are tracked as **engineering**, not design, and are referenced here only where design depends on them.

| ID | Issue | Impact | Confidence | Effort | Score | Type | Override |
|---|---|---:|---:|---:|---:|---|---|
| UX-001 | Hero/ghost-CTA contrast over photos | 5 | 5 | 1 | 25.0 | Quick win | **A11y** |
| CONTENT-003 | "Bussiness & Learning" typo (data) | 3 | 5 | 1 | 15.0 | Quick win | — |
| UX-004 | Batch dates hidden until next step | 5 | 5 | 3 | 8.3 | Structural | **Funnel** |
| UX-005 | Discount badge mismatch (5% vs ~23%) | 4 | 3 | 1 | 12.0 | Quick win | Trust |
| UX-002 | Dual category taxonomy on /experiences | 3 | 5 | 3 | 5.0 | Structural | — |
| UX-007 | Long italic serif hero block | 2 | 5 | 1 | 10.0 | Quick win | — |
| PERF-006 | Perceived-empty hero / CLS | 4 | 3 | 3 | 4.0 | Structural | — |
| SYS-008 | No spacing/radius/elevation tokens | 4 | 5 | 4 | 5.0 | Structural | — |
| A11Y-009 | Alt-text + heading-order pass | 3 | 3 | 3 | 3.0 | Structural | **A11y** |
| UX-010 | Consent + desktop nav affordance | 3 | 3 | 2 | 4.5 | Quick win | Compliance |

### Quick wins (low effort, ship first, each still gated)
UX-001 (contrast), CONTENT-003 (typo — data), UX-005 (truthful discount), UX-007 (hero copy), UX-010 (consent/nav check).

### Structural (plan, design, then build)
UX-004 (dates on detail), UX-002 (taxonomy), PERF-006 (media/CLS), SYS-008 (tokens), A11Y-009 (a11y pass).

---

## Phases (recommended sequence)

> Each phase: **scope · deliverables · success criteria · QA checklist · risks · approval gate**. Re-prioritized from the prompt's starting hypothesis based on evidence — **accessibility + booking-funnel transparency lead**, before broad visual polish.

### Phase 0 — Foundations & critical blockers
- **Scope:** UX-001 hero contrast; formalize tokens SYS-008 (spacing/radius/elevation — additive, no visual change); CONTENT-003 typo (data fix via Admin).
- **Deliverables:** Scrim/CTA contrast fix spec + implementation; `--space/--radius/--elevation` token file; corrected category name.
- **Success:** All hero text ≥4.5:1 (large ≥3:1); tokens documented + consumed by at least the hero/cards; typo gone, category still routes.
- **QA:** Contrast tool pass desktop/tablet/mobile; visual regression on hero + cards; category page + banner load after rename.
- **Risks:** Token migration touching many files — do incrementally; typo rename must not break the name-derived slug/banner.
- **Approval gate:** ✅ required before any code.

### Phase 1 — Homepage & global navigation
- **Scope:** Hero clarity + optional search prominence (balanced with brand voice); desktop nav affordance (UX-010); card consistency; footer.
- **Deliverables:** Hero layout spec; nav/consent decision; card component tokens applied.
- **Success:** Clear value prop + primary action above the fold at all breakpoints; top destinations reachable on desktop; consistent card system.
- **QA:** Desktop ≥1280 + tablet + mobile; keyboard nav; focus visible.
- **Risks:** Don't bury the editorial/host-led story under OTA-style search density.
- **Approval gate:** ✅.

### Phase 2 — Categories, search & discovery
- **Scope:** UX-002 single canonical taxonomy; live result counts per filter; empty states; category banner/title/highlights (recently fixed — verify across all categories).
- **Deliverables:** Taxonomy decision + one control; empty-state designs.
- **Success:** One authoritative category control; counts update; graceful empty states; multi-word category banners render (regression-checked).
- **QA:** Each category desktop/tablet/mobile; sold-out/empty; long names.
- **Approval gate:** ✅.

### Phase 3 — Trip detail & booking conversion (depends on engineering)
- **Scope:** UX-004 surface upcoming batch dates + availability on the detail page; UX-005 truthful discount; PERF-006 reserved media + skeletons; keep sticky mobile CTA.
- **Deliverables:** Detail-page date module design; discount rules; media/skeleton spec.
- **Success:** Valid future batches visible pre-CTA; truthful single discount figure; measured CLS < 0.1; no perceived-empty hero.
- **QA:** Multiple trips, sold-out/past dates, timezone boundaries; mobile sticky CTA; failed-payment/recovery states.
- **Dependency:** Engineering batch-availability fix (Varanasi) + Razorpay reliability — **tracked separately**; design must not mask functional bugs.
- **Approval gate:** ✅.

### Phase 4 — Hosts & trust
- **Scope:** Host directory/profile layout; title alignment (recently fixed — verify across short/long names, many specialties); credibility/dynamic content consistency.
- **Deliverables:** Host card/detail spec confirming the shared component; long-name + badge wrapping rules.
- **Success:** Consistent host cards everywhere; stable title alignment for any host; real trust signals only.
- **QA:** Short/long host names, 0/1/many specialties, missing image fallback; desktop/tablet/mobile.
- **Approval gate:** ✅.

### Phase 5 — Editorial, brand polish, responsive refinement
- **Scope:** Blog/About, microinteractions, imagery consistency, UX-007 copy, reduced-motion support.
- **Success:** Consistent imagery + motion that respects `prefers-reduced-motion`; readable editorial.
- **Approval gate:** ✅.

### Phase 6 — Admin / Host Dashboard UX (separate operational workstream)
- **Scope:** Form consistency, previews, draft/validation patterns (drafts + field-level errors + readable inputs recently added — extend the pattern to Trip/Post/Booking forms), upload affordances, table readability.
- **Success:** Consistent reusable form error/draft components across admin; readable tables; no invisible-text fields.
- **Note:** Must not displace customer-facing conversion priorities (Phases 0–3 first).
- **Approval gate:** ✅.

### Phase 7 — Measurement & optimization
- **Scope:** Full WCAG 2.2 AA verification (keyboard, focus, alt/heading, reduced motion); Core Web Vitals measurement; analytics instrumentation proposal; usability tests; conversion experiments.
- **Deliverables:** A11y conformance report; measured CWV; experiment backlog.
- **Success:** Documented AA conformance; baseline CWV; prioritized experiment plan (no invented uplifts).
- **Approval gate:** ✅.

---

## Dependencies & regression risks (cross-cutting)

- **Token migration (SYS-008)** underlies Phases 1–5 — do it first, incrementally, to avoid churn.
- **Booking funnel (Phase 3)** depends on engineering availability/payment fixes — coordinate; never present a design fix as a functional fix.
- **Category rename (CONTENT-003)** interacts with name-derived slugs/banners — verify routing.
- Every change must be tested **desktop / tablet / mobile** and with **dynamic content** (long names, empty states, sold-out dates).

## Recommended first approval

**Phase 0** (accessibility contrast + token foundations + the live typo) — highest priority scores, lowest risk, unblocks later phases.
