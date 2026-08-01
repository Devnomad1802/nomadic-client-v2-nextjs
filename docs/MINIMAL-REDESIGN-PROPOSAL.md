# Nomadic Townies — Minimal Redesign Proposal ("White canvas, one ember")

Status: proposal only. Baseline = main (warm clay/cream). The Ember/Pine/Brass
redesign branch is ABANDONED per the fresh-start brief.

## Direction
White-dominant, neutral cool-grey, charcoal text (Notion/Linear/Vercel/Stripe).
The ONLY chroma is the logo orange #CF4A2C, used sparingly (CTA / active / links /
small accents). No amber, no cream, no brown, no peach.

## Tokens
```css
:root{
  --bg:#FFFFFF; --bg-secondary:#FAFAFA;
  --surface:#FFFFFF; --surface-elevated:#FFFFFF; --surface-muted:#F4F4F5; --surface-dark:#18181B;
  --text:#18181B; --text-secondary:#52525B; --text-muted:#71717A; --text-disabled:#A1A1AA; --text-inverse:#FFFFFF;
  --border-light:#F4F4F5; --border:#E4E4E7; --border-strong:#D4D4D8;
  --ember:#CF4A2C; --ember-hover:#B83F23; --ember-wash:#FDECE8;
  --success:#15803D; --warning:#A66412; --error:#B42318; --info:#175CD3;
  --shadow-sm:0 1px 2px rgba(24,24,27,.06);
  --shadow-md:0 4px 12px -2px rgba(24,24,27,.08);
  --shadow-lg:0 12px 32px -8px rgba(24,24,27,.12);
  --card:#FFFFFF; --card-hover:#FAFAFA; --card-selected-border:#CF4A2C;
}
```

Neutral scale (Zinc-like): N-0 #FFFFFF · N-50 #FAFAFA · N-100 #F4F4F5 · N-200 #E4E4E7 ·
N-300 #D4D4D8 · N-400 #A1A1AA · N-500 #71717A · N-600 #52525B · N-800 #27272A · N-900 #18181B.

## Component map
Hero white/photo+scrim, charcoal type, ember CTA only · sections alternate #FFFFFF/#FAFAFA ·
cards white + #E4E4E7 hairline + shadow-sm, selected = ember border · buttons: primary ember,
secondary charcoal, ghost/outline neutral · nav white (ember active), footer #18181B ·
tabs active ember underline · inputs white + ember focus ring · badges neutral, success green,
ratings charcoal/ember star (no gold) · booking/payment/invoice white + ember CTA + green Paid ·
chat white + #F4F4F5 bubbles + ember outgoing · timelines neutral line, ember current node ·
emails white + charcoal + ember button.

## Accessibility
#18181B on white 17.4:1 (AAA); #52525B 7.6:1 (AAA); #71717A 4.9:1 (AA); white on ember 4.6:1 (AA);
status greens/reds ≥4.9:1 (AA). Charcoal-on-white = max long-read comfort; ember reserved for
interaction = strong CTA visibility.

## Implementation (post-approval, feature branch)
1. Swap token VALUES: warm ink -> neutral grey, cream surfaces -> white/N-50, drop amber (warning
   -> deep ochre, rating -> charcoal/ember). Keep --brand-*/--surface* names; add neutral aliases.
2. Restrict orange: strip ember from backgrounds/tints; keep only CTA/active/link/selected.
3. MUI Theme.js -> neutral surfaces + ember primary; fix stray teal in variant borders (#2CBCA5).
4. Update drift guard retired list. Page-by-page screenshot diff. Vercel preview -> review -> main.
