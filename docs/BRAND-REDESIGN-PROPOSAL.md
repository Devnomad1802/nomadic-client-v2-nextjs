# Nomadic Townies — Brand Color System Redesign (Proposal)

**Status: proposal only — no code changed.** Awaiting approval before implementation.

Codename: **"Ember · Pine · Brass on Stone"**

---

## 1. Website audit (current state)
The site was just unified into a single **warm clay + cream** system (see `docs/BRAND-COLOR-AUDIT.md`, `globals.css` tokens, drift guard). It's consistent and AA-clean. So this is **not** a consistency rescue — it's a deliberate **elevation** to a more premium, distinctive identity.

**What the current system does well:** one warm personality, tokenized, guarded.
**Where it caps out (the reason to redesign):**
- **Single-hue.** Everything is clay-orange + cream. Premium travel brands anchor warmth with a **calm secondary** (Airbnb: charcoal + coral; the best feel two-note). We have no real secondary — dark ink stands in for it.
- **Cream leans yellow** (`#F4EEE4`, hsl 38°) — cozy but slightly "rustic B&B" rather than "world-class product." Notion/Apple/Stripe sit on cooler, quieter oat/stone.
- **Cards are cream** (`#FFFDF9`) — softer than the crisp true-white cards that read premium and let photography pop.
- **No dedicated "premium" accent** — ratings, host badges, verified marks all borrow orange, so nothing signals *quality* distinctly.

## 2. Current inconsistencies (already fixed, for the record)
7 oranges → 1, cool/warm neutral split → warm ink, 4 greens → 1, `#FBC800` yellow fixed, MUI teal fixed, `#FFF4F1` pink retired. Baseline is clean — we're redesigning from a good place, not a broken one.

## 3. The new palette

**Concept:** *Ember* (host-led warmth, the fire you gather around) + *Pine* (nature, trust, the outdoors) + *Brass* (premium, earned quality) on *Stone* (calm, modern, quiet luxury). Warm like Airbnb, calm like Notion, crisp like Apple.

### Brand Primary — Ember (terracotta, logo-true but deepened)
| Token | HEX | RGB | HSL | Use |
|---|---|---|---|---|
| primary-50 | `#FBF0EC` | 251,240,236 | 16,60,95 | washes |
| primary-100 | `#F4D8CE` | 244,216,206 | 16,60,88 | tints/chips |
| primary-200 | `#E9B4A2` | 233,180,162 | 15,61,77 | hover tints |
| primary-400 | `#D9714F` | 217,113,79 | 15,63,58 | decorative/gradients |
| **primary-600 (PRIMARY)** | `#C8462A` | 200,70,42 | 11,65,47 | CTAs, links, active |
| primary-700 | `#A63A22` | 166,58,34 | 11,66,39 | hover/pressed |
| primary-800 | `#7E2C19` | 126,44,25 | 11,67,30 | text on tint |

### Brand Secondary — Pine (deep forest green)
| Token | HEX | RGB | HSL | Use |
|---|---|---|---|---|
| pine-50 | `#EAF1EE` | 234,241,238 | 154,20,93 | success/nature washes |
| pine-500 | `#3C7565` | 60,117,101 | 163,32,35 | secondary buttons, host/trust surfaces |
| **pine-600** | `#2F5D50` | 47,93,80 | 163,33,27 | secondary CTA, section accents |
| pine-800 | `#1E3B33` | 30,59,51 | 163,33,17 | dark nature bands |

### Accent — Brass (antique gold, premium signal)
| Token | HEX | RGB | HSL | Use |
|---|---|---|---|---|
| brass-100 | `#F5E7CC` | 245,231,204 | 40,68,88 | premium/host badge bg |
| **brass-500 (ACCENT)** | `#C08A2D` | 192,138,45 | 38,62,46 | ratings, verified, "premium host", awards |
| brass-700 | `#8C621C` | 140,98,28 | 38,67,33 | accent text |

### Neutrals — Stone (warm-but-quiet oat; cooler & more premium than today's cream)
| Step | HEX | RGB | HSL | Use |
|---|---|---|---|---|
| stone-50 | `#F7F4EF` | 247,244,239 | 38,31,95 | page background |
| stone-100 | `#EFEAE1` | 239,234,225 | 39,29,91 | soft sections, hairlines |
| stone-200 | `#E1DACE` | 225,218,206 | 38,25,85 | borders/dividers |
| stone-300 | `#CBC2B3` | 203,194,179 | 37,22,75 | disabled, strong border |
| stone-400 | `#A79D8C` | 167,157,140 | 38,15,60 | captions |
| stone-500 | `#857C6C` | 133,124,108 | 38,10,47 | secondary text |
| stone-600 | `#6B6355` | 107,99,85 | 38,11,38 | body text |
| stone-700 | `#4E483D` | 78,72,61 | 38,12,27 | strong body |
| stone-800 | `#33302A` | 51,48,42 | 40,10,18 | emphasis/dark UI |
| stone-900 | `#1E1C18` | 30,28,24 | 40,11,11 | headings, navbar/footer |

### Backgrounds / Surfaces / Cards
| Token | HEX | Note |
|---|---|---|
| `--bg` (page) | `#F7F4EF` | stone-50 — quieter than today's `#F4EEE4` |
| `--surface` (cards) | `#FFFFFF` | **true white** — the premium shift; photos pop, feels crisp |
| `--surface-soft` (insets) | `#EFEAE1` | stone-100 |
| `--surface-dark` | `#1E1C18` | stone-900 bands (navbar/footer/ticket) |

### Semantics (tuned to the family)
| Role | HEX | RGB | HSL | Tint |
|---|---|---|---|---|
| success | `#2E6E4E` | 46,110,78 | 150,41,31 | `#E6F0EA` |
| warning | `#B8801C` | 184,128,28 | 38,74,42 | `#F8EED6` |
| error | `#B23A2E` | 178,58,46 | 5,59,44 | `#F7E5E2` |
| info | `#34627D` | 52,98,125 | 202,41,35 | `#E4EDF2` |

### Interaction states
- **Link** primary-600 · **hover** primary-700 · **active** primary-800.
- **Focus** 2px primary-600 ring + 2px offset (keep from current system).
- **Disabled** stone-300 fill / stone-400 text / 60% opacity.
- **Icon** default stone-600; interactive primary-600; premium brass-500.

## 4. Component mapping
- **Hero / dark bands** stone-900 bg, stone-50 text, ember highlight on the italic word.
- **Homepage sections** alternate `--bg` (stone-50) / `--surface-soft` (stone-100).
- **Choose Your Adventure** cards white surface, stone-200 border, gradient overlay stone-900→transparent.
- **Experience cards** `--surface` white, stone-200 border, ember price, brass rating star, pine "Verified host" badge on `pine-50`.
- **Host cards / Host Detail** pine as the trust surface — `pine-50` panels, pine-600 headers, brass "Premium host".
- **Review cards** white surface, brass stars, stone-600 text.
- **Booking / Payment / Invoice** white surface, ember CTA, pine "Confirmed/Paid" status, brass on the invoice logo mark for a premium letterhead.
- **Buttons** primary = ember fill/white; secondary = pine outline (or pine fill on nature contexts); ghost = stone-300 border.
- **Chips/Tags** stone-100 bg default, primary-100 when brand-tinted, pine-50 for category "nature" types.
- **Badges** pine-50/pine-600 (verified/trust), brass-100/brass-700 (premium), success/warning/error tints for status.
- **Forms/Inputs** white bg, stone-200 border, ember focus ring, error/success semantic borders.
- **Nav / Footer** stone-900. **Mobile nav** same, ember active item.
- **Tabs** inactive stone-500, active ember. **Pagination** white + stone-200, active ember.
- **Empty states** stone-100 panel, stone-500 text, ember CTA. **Loading** stone-100 skeletons.
- **Timelines** pine connectors for progress, ember for the current step.
- **Search / Filters** white field, stone-200 border, ember active chip.

## 5. Design tokens (drop-in for `globals.css :root`)
```css
:root{
  /* brand — ember */
  --primary-50:#FBF0EC; --primary-100:#F4D8CE; --primary-200:#E9B4A2;
  --primary-400:#D9714F; --primary-600:#C8462A; --primary-700:#A63A22; --primary-800:#7E2C19;
  /* secondary — pine */
  --pine-50:#EAF1EE; --pine-500:#3C7565; --pine-600:#2F5D50; --pine-800:#1E3B33;
  /* accent — brass */
  --brass-100:#F5E7CC; --brass-500:#C08A2D; --brass-700:#8C621C;
  /* neutrals — stone 50..900 */
  --stone-50:#F7F4EF; --stone-100:#EFEAE1; --stone-200:#E1DACE; --stone-300:#CBC2B3;
  --stone-400:#A79D8C; --stone-500:#857C6C; --stone-600:#6B6355; --stone-700:#4E483D;
  --stone-800:#33302A; --stone-900:#1E1C18;
  /* surfaces */
  --bg:#F7F4EF; --surface:#FFFFFF; --surface-soft:#EFEAE1; --surface-dark:#1E1C18;
  /* semantics */
  --success:#2E6E4E; --success-tint:#E6F0EA; --warning:#B8801C; --warning-tint:#F8EED6;
  --error:#B23A2E; --error-tint:#F7E5E2; --info:#34627D; --info-tint:#E4EDF2;
  --rating:#C08A2D;
}
```
Reuses the exact token infra already shipped (`globals.css :root`, MUI `Theme.js`, `scripts/check-colors.mjs` guard). Implementation = swap values + re-map the current tokens as aliases (`--brand-600 → var(--primary-600)`), so the 5 completed PRs' work is preserved, not thrown away.

## 6. Accessibility
| Pair | Ratio | Verdict |
|---|---|---|
| stone-900 on stone-50 | 14.8:1 | AAA |
| stone-600 body on white | 6.1:1 | AA (AAA at ≥18px) |
| white on primary-600 `#C8462A` | 4.9:1 | AA ✓ |
| white on pine-600 `#2F5D50` | 6.8:1 | AA (large AAA) |
| brass-700 on brass-100 | 5.2:1 | AA |
| primary-800 on primary-100 | 8.0:1 | AAA |
Every text pairing ≥ AA; long-session comfort improves (stone is lower-chroma than cream, less eye-buzz). Focus ring retained.

## 7. Professional lens
- **Airbnb** — warm brand + neutral calm + white cards. We match with ember + stone + true-white.
- **Notion / Apple** — quiet oat/stone canvas, content-first. Stone-50 delivers it (vs today's warmer cream).
- **Stripe** — restrained accent used sparingly for meaning. Brass does exactly that (only ratings/premium).
- **Result:** two-note (ember+pine) with a brass jewel-accent reads *premium, trustworthy, calm, memorable* — not "generic travel agency," not "colorful startup."

## 8. Before vs After
| | Current | Proposed |
|---|---|---|
| Primary | `#CF4A2C` clay | `#C8462A` ember (deeper, richer) |
| Secondary | — (dark ink stand-in) | **`#2F5D50` pine** (real nature secondary) |
| Accent | — (orange borrowed) | **`#C08A2D` brass** (premium signal) |
| Neutral | cream, hsl ~38° warm | **stone**, quieter/lower-chroma |
| Cards | `#FFFDF9` cream | **`#FFFFFF` true white** |
| Feel | cozy, rustic-warm | premium, calm, two-note |

## 9. Implementation strategy (post-approval, feature branch only)
1. **Swap token values** in `globals.css` + `Theme.js`; map old brand tokens → new as aliases (zero-break). Update the drift guard's retired list.
2. **Neutral re-skin** — cream→stone, cards cream→white, page-by-page with screenshot diffs.
3. **Introduce pine + brass** where they add meaning (host/trust surfaces, ratings, premium badges) — net-new, not replacements.
4. **Semantics** to the tuned set. **QA** every page/modal/mobile + a11y pass.
5. Push to feature branch → Vercel Preview → your review → merge.

## 10. Final recommendation
Adopt **Ember · Pine · Brass on Stone.** It keeps the logo's warmth (ember) but graduates the site from single-hue cozy to a **premium, nature-rooted, two-note identity with an earned-quality accent** — the exact register of the brands you named. It's a genuine redesign, yet it lands on the token/guard infrastructure already built, so execution is controlled and reversible.

*Alternative if you want minimal disruption:* keep the current clay/cream and only add **pine (secondary) + brass (accent) + true-white cards** — 70% of the premium lift for 30% of the change. Say which and I'll implement.
