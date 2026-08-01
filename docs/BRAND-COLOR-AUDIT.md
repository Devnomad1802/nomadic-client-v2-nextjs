# Nomadic Townies — Brand Color Audit (Next.js client)

**Repo:** `nomadic-client-v2-nextjs` · **Date:** 31 Jul 2026 · **Status: audit only — no colors changed.**

> The old Vite client (`nomadic-client-v2`) already received a unified color
> system (see its `COLOR_SYSTEM.md` / `src/styles/tokens.css`). **This Next.js
> port was branched from pre-unification code, so it carries all the original
> drift again.** Good news: the target palette is already designed, validated,
> and documented — this report maps it onto the Next.js structure. Implementation
> is a port, not a redesign.

---

## 1. Current inventory (measured)
- **308 distinct hex** + **273 distinct rgba()** in `src/`.
- Top: `#fff` 318×, `#CD482A` 102×, `#4B5563` 80×, `#000` 78×, `#221C17` 58×.
- **13 files** define private token sets (`--orange`, `const ACCENT`, `--accent`).

## 2. Inconsistencies

### 7 competing "primary oranges"
| Hex | Uses | | Hex | Uses |
|---|---|---|---|---|
| `#CD482A` | 102 | | `#EC3F18` | 25 |
| `#C4472C` | 36 | | `#E9622F` | 15 |
| `#CF4A2C` | 34 | | `#D24B2A` | 14 |
| `#FF0E07` | 10 (hearts-as-accent) | | | |

`#CD482A / #C4472C / #CF4A2C / #D24B2A` are visually indistinguishable — pure drift.

### Third color source — MUI theme is OFF-BRAND
`src/Theme.js` sets **`palette.primary.main = "#58C5DA"`** — a **teal/cyan**. Any MUI component using theme `primary` renders the wrong brand color entirely. High-priority conflict.

### Two rival neutral families
- **Cool grey (Tailwind):** `#111827 #1F2937 #4B5563 #6B7280 #9CA3AF #E5E7EB #F3F4F6 #F9FAFB`
- **Warm brown (identity):** `#221C17 #3C3228 #5A5247 #726A5E #8A8073 #A89C8A #E6DDCF #F4EEE4 #FBF6EE #FFFDF9`

Site switches personality mid-journey (cool homepage → warm booking flow).

### Semantic drift
4 greens (`#16A34A #2E7D4F #5BBF7A #1F7A45`), errors (`#C0392B`), warning yellow `#FBC800` (fails contrast), stars split `#FBC800`/`#F0A03C`.

## 3. Duplicate / conflicting — summary
Oranges ×7, greys ×2 families, greens ×4, warnings ×3, teal MUI primary ×1, 13 private token sets, `globals.css :root` holds **only fonts** (no color tokens).

## 4. Accessibility (WCAG 2.1 AA)
| Issue | Ratio | Verdict |
|---|---|---|
| `#9CA3AF` body text on white (44 uses) | 2.5:1 | **Fail** |
| `#FBC800` yellow text/badge on white | 1.6:1 | **Fail** |
| `#EC3F18` small text on cream | ~3.9:1 | borderline fail |
| `#CF4A2C` white-on-fill | 4.6:1 | Pass ✓ |
| `#221C17` on `#FFFDF9` | 15.9:1 | AAA ✓ |
| Focus ring | — | none (no `:focus-visible` system) |

## 5. Recommended palette (identical to the approved Vite system)

**Brand (clay)**
| Token | Hex | RGB | HSL | Use |
|---|---|---|---|---|
| brand-50 | `#FDF3EE` | 253,243,238 | 20,79,96 | washes |
| brand-100 | `#F6E4DC` | 246,228,220 | 18,59,91 | tints/chips |
| brand-500 | `#E9622F` | 233,98,47 | 16,81,55 | gradients/decor, never text |
| **brand-600 (PRIMARY)** | `#CF4A2C` | 207,74,44 | 11,65,49 | CTA/links/active |
| brand-700 | `#B83F23` | 184,63,35 | 11,68,43 | hover |

**Warm ink neutrals 50→900:** `#F4EEE4 #F1EADD #E6DDCF #D8CFC0 #A89C8A #8A8073 #726A5E #5A5247 #3C3228 #221C17`
**Surfaces:** `--surface #FFFDF9`, `--surface-soft #FBF6EE`, `--surface-dark #221C17`
**Semantics (one each):** success `#2E7D4F`/tint `#E4F4EA` · warning `#C8941E`/`#FBF3E4` · error `#C0392B`/`#FDF4F1` · info `#3D6B8A`/`#EAF1F6` · rating `#F0A03C` (stars only)

Full hex/RGB/HSL/usage per token: see `COLOR_SYSTEM.md` (portable spec — copy verbatim).

## 6. Component recommendations (delta)
Buttons brand-600/700 · kill `#EC3F18` fills · Navbar/Footer/Chat/toast `--surface-dark`+cream · cards `--surface`+ink-200 border, warm shadow · links brand-600 · hearts brand-600 (not `#FF0E07`) · inputs surface+ink-200, focus brand-600 ring · ratings `--rating` · badges tint+700-text · Invoice/emails already warm (reference impl). **Fix MUI `Theme.js` `primary.main → #CF4A2C`.**

## 7. Token strategy (Next.js-specific)
1. Add color tokens to the existing **`src/app/globals.css :root`** (fonts already live there — natural home; loaded once in `app/layout.tsx`).
2. Set MUI **`Theme.js`** palette to read the same values (`primary.main #CF4A2C`, etc.) so MUI + CSS agree.
3. Alias the 13 private sets → global tokens during migration (keep `--orange` = `var(--brand-600)`), remove aliases at the end.
4. Ban raw hex in new code via a lint grep.

## 8. Implementation roadmap
1. **PR1** — `globals.css` tokens + `Theme.js` primary fix + aliases (near-zero visual change except MUI teal→clay).
2. **PR2** — orange unification (7→brand ramp).
3. **PR3** — neutral re-skin (cool greys→warm ink) — the visible pass, page-by-page.
4. **PR4** — semantics (4 greens→1, warning fix) + global `:focus-visible` ring.
5. **PR5** — cleanup, remove aliases, lint guard.

## 9. Impact
308 hexes → ~30 tokens. PR1 mostly invisible (except the MUI teal correction — a real bug fix). PR3 is the medium-risk re-skin. Net: one brand personality end-to-end, AA-clean text, a focus system, MUI + CSS aligned.

## 10. Visual direction
Swatches shown in chat; the exact ramp is in `COLOR_SYSTEM.md`.

---
*No production colors modified for this report.*
