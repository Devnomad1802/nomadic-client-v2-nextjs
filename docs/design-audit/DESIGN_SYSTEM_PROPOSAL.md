# Design System Proposal — Nomadic Townies

**Status:** PROPOSAL ONLY. Nothing here is implemented. The "Current (in code)" sections are extracted verbatim from `src/app/globals.css` and `src/app/layout.tsx`; the "Proposed" sections are additive recommendations to formalize gaps (chiefly spacing/radius/elevation).

---

## 1. Brand color audit (actual, from source)

> **Logo color:** The site wordmark sets "nomadic" in the brand orange and "townies" in near-black ink. The source logo asset was **not pixel-sampled** this pass — recommend sampling `public/logo3.png` / the logo SVG to confirm the exact orange equals `#CF4A2C`. The on-site CSS token used for brand elements is below and appears consistent with the wordmark.

### Current brand ramp (in code — Verified)
| Token | HEX | Use (as documented in code) |
|---|---|---|
| `--brand-50` | `#FDF3EE` | tint backgrounds |
| `--brand-100` | `#F6E4DC` | tint backgrounds |
| `--brand-500` | `#E9622F` | **bright — gradients/decor only, never text** |
| `--brand-600` | `#CF4A2C` | **PRIMARY — CTAs, links, active** |
| `--brand-700` | `#B83F23` | hover / pressed |

### Current ink neutrals (warm) — Verified
`--ink-900 #221C17` · `--ink-800 #3C3228` · `--ink-700 #5A5247` · `--ink-600 #726A5E` · `--ink-500 #8A8073` · `--ink-400 #A89C8A` · `--ink-300 #D8CFC0` · `--ink-200 #E6DDCF` · `--ink-100 #F1EADD` · `--ink-50 #F4EEE4`

### Current surfaces & semantic — Verified
- Surfaces: `--surface #FFFDF9` · `--surface-soft #FBF6EE` · `--surface-dark #221C17`
- Semantic: `--success #2E7D4F` / tint `#E4F4EA` · `--warning #C8941E` / `#FBF3E4` · `--error #C0392B` / `#FDF4F1` · `--info #3D6B8A` / `#EAF1F6` · `--rating #F0A03C` (stars only)
- Aliases: `--orange→brand-600`, `--accent→brand-600`, `--text→ink-700`, `--line→ink-200`, etc.

**Assessment:** This is a **well-designed, restrained palette** with a single accent and a warm neutral ramp — keep it. Two things to verify (not change blindly):
- **AA contrast pairs:** confirm `--brand-600 #CF4A2C` on `--surface #FFFDF9` for CTA text (white on `#CF4A2C` is ~4.6:1 — OK for ≥18px/bold; verify small text) and body `--text #5A5247` on surfaces (≈7:1 — OK).
- **Over-photo text:** none of these tokens guarantee contrast over imagery — needs a fixed scrim (see audit UX-001).

---

## 2. Typography

### Current (Verified)
- **Inter** → UI/sans (`--inter`).
- **Playfair / Playfair Display** → display serif headings (`--playfair`).
- **Newsreader** → editorial serif body/quotes (`--serif`).
- **ZingScript (local)** → decorative only (`--zingscript`).
- (Admin uses Bricolage Grotesque + Hanken Grotesk on the host-detail template — a separate family set; see consistency note.)

### Proposed type scale (formalize; additive)
A modular scale (1.25) with fluid clamps, mapped to tokens so headings/body are consistent cross-page:

| Token | Size (fluid) | Line-height | Use |
|---|---|---|---|
| `--text-xs` | 12px | 1.4 | captions, chips |
| `--text-sm` | 14px | 1.5 | secondary/body-sm |
| `--text-base` | 16px | 1.6 | body (min body size) |
| `--text-lg` | 18px | 1.55 | lead paragraph |
| `--text-xl` | clamp(20–22px) | 1.3 | card titles |
| `--text-2xl` | clamp(24–28px) | 1.25 | section headings |
| `--text-3xl` | clamp(30–40px) | 1.15 | page H1 |
| `--text-hero` | clamp(32–56px) | 1.1 | hero display |

Rules: body ≥16px; line length ~60–75ch; reserve italic serif for accents, not long blocks (audit UX-007); one H1/page.

---

## 3. Spacing scale (PROPOSED — currently missing)

No spacing tokens exist today (audit SYS-008). Propose an 8px-based scale:

| Token | px | Typical use |
|---|---|---|
| `--space-1` | 4 | icon gaps |
| `--space-2` | 8 | tight stacks, chip padding |
| `--space-3` | 12 | control padding |
| `--space-4` | 16 | card padding (mobile), base gap |
| `--space-5` | 24 | card padding (desktop), block gap |
| `--space-6` | 32 | sub-section gap |
| `--space-8` | 48 | section padding (mobile) |
| `--space-10` | 64 | section padding (desktop) |
| `--space-12` | 96 | hero / major section rhythm |

Adopt via CSS vars; migrate components incrementally (new/changed components first).

## 4. Radius scale (PROPOSED — formalize)

| Token | px | Use |
|---|---|---|
| `--radius-sm` | 8 | inputs, chips |
| `--radius-md` | 12 | buttons, small cards |
| `--radius-lg` | 16–18 | cards, panels (matches current host/hd cards) |
| `--radius-xl` | 22 | feature panels |
| `--radius-pill` | 999 | pills, filter chips, CTAs |

## 5. Elevation scale (PROPOSED — formalize)

| Token | Shadow | Use |
|---|---|---|
| `--elevation-0` | none | flat surfaces |
| `--elevation-1` | `0 1px 2px rgba(34,28,23,.06)` | cards at rest |
| `--elevation-2` | `0 6px 16px -8px rgba(34,28,23,.18)` | hover / raised cards |
| `--elevation-3` | `0 24px 60px -20px rgba(0,0,0,.35)` | modals, lightbox |

## 6. Grid & breakpoints (PROPOSED — document existing + codify)

- Container max: `1180–1240px` (as used on host/experiences pages).
- Gutters: 16px (mobile) → 32–48px (desktop) via `--space-*`.
- Breakpoints: `sm 480` · `md 720` (nav collapses ~800 today — align to 768) · `lg 1024` · `xl 1280` · `2xl 1440`.
- Card grids: `repeat(auto-fill, minmax(340px, 1fr))` (already used for host cards) — standardize across trip/host/category cards.

## 7. Component states (PROPOSED specs)

### Button
| Variant | Rest | Hover | Active | Disabled | Focus |
|---|---|---|---|---|---|
| Primary | bg `--brand-600`, text #fff, `--radius-pill` | bg `--brand-700`, translateY(-1px) | bg `--brand-700` | 50% opacity, no pointer | 2px outline `--brand-600` offset 2px |
| Secondary (ghost) | transparent, 1.5px `--brand-600` border, text `--brand-600` | bg `--brand-50` | bg `--brand-100` | muted | same focus ring |
| On-photo secondary | **solid/≥70% dark fill** (fix UX-001) + #fff text | lighten | — | — | visible ring |

Min target 44×44px; ≥8px spacing between adjacent controls.

### Input / Select
- Rest: bg `--surface`, 1px `--line`, text `--ink-900` (**always ensure dark text — see the admin Section-title bug**), radius `--radius-sm`.
- Focus: 1.5px `--brand-600` border + ring. Placeholder: `--ink-400` (distinct from value).
- Error: 1px `--error` border + message below in `--error`, associated via `aria-describedby`.

### Card (trip/host)
- bg `--surface`, 1px `--line`, `--radius-lg`, `--elevation-1` → hover `--elevation-2` + translateY(-3px).
- Media: fixed aspect-ratio box (reserve space — fix PERF-006), `object-fit: cover`, `loading="lazy"`, meaningful `alt`.
- Uniform heights via `margin-top:auto` on CTA row (already used in `HostFeatureCard`).

## 8. Imagery standards (PROPOSED)

- Formats: prefer WebP/AVIF; provide width/height or aspect-ratio to prevent CLS.
- Hero: fixed aspect ratio + consistent dark scrim guaranteeing ≥4.5:1 text contrast.
- Alt: descriptive for meaningful images; `alt=""` for decorative. Consent/licensing tracked for host-supplied photos.
- Consider `next/image` (or explicit sizing + `fetchpriority="high"` on hero) since the client currently uses raw `<img>`.

## 9. Cross-surface consistency note

The **public client** uses Inter/Playfair/Newsreader + the ink/brand ramp; the **host-detail template** and **Admin** use Bricolage Grotesque + Hanken Grotesk. This is intentional in places but should be a **documented decision** (brand = public; operational = admin) rather than drift. Recommend one token file per surface with shared brand colors.

---

*All "Proposed" items require approval before any implementation. The "Current" values are reported for accuracy, not changed.*
