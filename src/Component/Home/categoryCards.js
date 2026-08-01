/**
 * Hard-coded category-card designs (illustration + gradient + copy) from the
 * "Category Cards" design. Matched to live DB categories by name via matchTemplate().
 * Descriptions/tags are intentionally hard-coded here (per design), not DB-driven.
 */

export const CATEGORY_TEMPLATES = {
  india: {
    name: "India",
    gradient: "linear-gradient(160deg,#FAFAFA,#F4F4F5)",
    desc: "From the Taj to the backwaters — handpicked journeys across the subcontinent.",
    tags: ["Heritage", "Himalayas"],
    scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#CF4A2C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M150 60 q-22 14 -22 40 q0 14 22 14 q22 0 22 -14 q0 -26 -22 -40Z"></path>
        <line x1="150" y1="44" x2="150" y2="60"></line>
        <circle cx="150" cy="40" r="4" fill="#CF4A2C" stroke="none"></circle>
        <path d="M128 114 l44 0 l0 8 l8 0 l0 56 l-60 0 l0 -56 l8 0Z"></path>
        <path d="M140 178 l0 -34 q10 -14 20 0 l0 34" stroke-width="3"></path>
        <path d="M124 178 l0 -16 q5 -8 10 0 l0 16" stroke-width="2.4"></path>
        <path d="M166 178 l0 -16 q5 -8 10 0 l0 16" stroke-width="2.4"></path>
        <line x1="96" y1="104" x2="96" y2="178" stroke-width="3"></line>
        <path d="M91 104 l10 0" stroke-width="3"></path>
        <circle cx="96" cy="98" r="5" fill="#CF4A2C" stroke="none"></circle>
        <line x1="204" y1="104" x2="204" y2="178" stroke-width="3"></line>
        <path d="M199 104 l10 0" stroke-width="3"></path>
        <circle cx="204" cy="98" r="5" fill="#CF4A2C" stroke="none"></circle>
        <path d="M120 114 q-7 -10 -14 0" stroke-width="2.6"></path>
        <path d="M180 114 q7 -10 14 0" stroke-width="2.6"></path>
        <line x1="78" y1="178" x2="222" y2="178" stroke-width="3.5"></line>
      </g>
      <line x1="110" y1="196" x2="190" y2="196" stroke="#EC9B7A" stroke-width="2.5" stroke-linecap="round"></line>
      <line x1="124" y1="206" x2="176" y2="206" stroke="#EC9B7A" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="232" cy="58" r="12" fill="none" stroke="#EC9B5A" stroke-width="3"></circle>
      <path d="M58 64 q5 -5 10 0 q5 -5 10 0" fill="none" stroke="#CF4A2C" stroke-width="2" stroke-linecap="round"></path>
    </svg>`,
  },
  international: {
    name: "International",
    gradient: "linear-gradient(160deg,#EEF3FB,#DCE6F7)",
    desc: "Cross borders with a community. Curated group trips beyond the map's edge.",
    tags: ["Bali", "Vietnam"],
    scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#2d4b9f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="150" cy="120" r="56"></circle>
        <path d="M96 104 q54 22 108 0"></path>
        <path d="M96 136 q54 22 108 0"></path>
        <ellipse cx="150" cy="120" rx="24" ry="56"></ellipse>
        <line x1="150" y1="64" x2="150" y2="176"></line>
      </g>
      <g fill="#CF4A2C">
        <path d="M128 96 q16 -8 26 2 q-4 12 -18 12 q-12 -4 -8 -14Z"></path>
        <path d="M150 138 q18 -2 22 12 q-10 12 -24 6 q-6 -12 2 -18Z"></path>
      </g>
      <ellipse cx="150" cy="120" rx="86" ry="40" fill="none" stroke="#2d4b9f" stroke-width="2" stroke-dasharray="5,6" opacity=".5" transform="rotate(-18 150 120)"></ellipse>
      <g transform="rotate(-18 150 120)">
        <path d="M232 104 l10 -3 l-3 8 l-7 -5Z" fill="#CF4A2C"></path>
        <path d="M236 105 l-12 4" stroke="#CF4A2C" stroke-width="2.5" stroke-linecap="round"></path>
      </g>
    </svg>`,
  },
  influencer: {
    name: "Influencer Trip",
    gradient: "linear-gradient(160deg,#FDF0EB,#F8DCD0)",
    desc: "Travel alongside creators you follow. Content, community, and real connection.",
    tags: ["Creators", "Content"],
    scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#CF4A2C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="96" y="96" width="108" height="74" rx="12"></rect>
        <path d="M126 96 l6 -14 l36 0 l6 14"></path>
        <circle cx="150" cy="134" r="24"></circle>
        <circle cx="150" cy="134" r="11"></circle>
        <circle cx="186" cy="112" r="3.5" fill="#CF4A2C" stroke="none"></circle>
      </g>
      <g fill="#CF4A2C">
        <path d="M210 84 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3Z"></path>
        <path d="M84 150 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z"></path>
      </g>
      <path d="M218 150 q-10 -10 -18 0 q-8 -10 -18 0 q0 12 18 22 q18 -10 18 -22Z" fill="none" stroke="#2d4b9f" stroke-width="2.5" opacity=".5"></path>
    </svg>`,
  },
  workshops: {
    name: "Workshops",
    gradient: "linear-gradient(160deg,#FEF6EC,#FBE7C8)",
    desc: "Learn a craft on the road — pottery, photography, writing, cooking and more.",
    tags: ["Creative", "Hands-on"],
    scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#C4883A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M104 96 q-30 2 -30 36 q0 30 34 32 q10 0 10 -10 q0 -8 8 -8 q14 0 14 -16 q0 -36 -36 -34Z"></path>
      </g>
      <ellipse cx="108" cy="150" rx="9" ry="7" fill="none" stroke="#C4883A" stroke-width="2.5"></ellipse>
      <circle cx="94" cy="116" r="5" fill="#CF4A2C"></circle>
      <circle cx="116" cy="112" r="5" fill="#2d4b9f"></circle>
      <circle cx="86" cy="138" r="5" fill="#15803D"></circle>
      <g stroke-linecap="round">
        <line x1="150" y1="170" x2="200" y2="108" stroke="#27272A" stroke-width="4"></line>
        <path d="M196 104 l12 -10 l6 8 l-10 12Z" fill="#CF4A2C" stroke="#CF4A2C"></path>
        <line x1="150" y1="170" x2="160" y2="160" stroke="#C4883A" stroke-width="6"></line>
      </g>
      <g fill="#CF4A2C"><circle cx="214" cy="150" r="3"></circle><circle cx="226" cy="134" r="2.5"></circle><circle cx="206" cy="132" r="2"></circle></g>
    </svg>`,
  },
  retreats: {
    name: "Retreats",
    gradient: "linear-gradient(160deg,#EDF7F1,#D3EBDD)",
    desc: "Yoga, wellness and silent escapes. Slow down, breathe, and come back lighter.",
    tags: ["Yoga", "Wellness"],
    scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#15803D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="150" cy="92" r="15"></circle>
        <path d="M150 107 q-22 8 -22 38 q0 14 22 14 q22 0 22 -14 q0 -30 -22 -38Z"></path>
        <path d="M110 158 q40 22 80 0"></path>
        <path d="M132 138 q-14 6 -18 18"></path>
        <path d="M168 138 q14 6 18 18"></path>
      </g>
      <g fill="none" stroke="#CF4A2C" stroke-width="2.5" stroke-linecap="round">
        <path d="M150 176 q-30 -4 -42 8 q18 12 42 6"></path>
        <path d="M150 176 q30 -4 42 8 q-18 12 -42 6"></path>
        <path d="M150 178 q-14 -2 -18 10 q10 6 18 2"></path>
        <path d="M150 178 q14 -2 18 10 q-10 6 -18 2"></path>
      </g>
      <circle cx="150" cy="120" r="74" fill="none" stroke="#15803D" stroke-width="1.5" stroke-dasharray="3,7" opacity=".45"></circle>
      <g fill="#15803D" opacity=".7"><circle cx="96" cy="70" r="2.5"></circle><circle cx="208" cy="80" r="2.5"></circle></g>
    </svg>`,
  },
  trekking: {
    name: "Trekking & Adventure",
    gradient: "linear-gradient(160deg,#EAF0F4,#CFE0E6)",
    desc: "High passes, hidden trails and adrenaline. For those who measure trips in altitude.",
    tags: ["Treks", "Camping"],
    scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#2c5364" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M70 178 L138 78 L206 178"></path>
        <path d="M120 104 l18 -26 l18 26 l-12 -6 l-6 8 l-8 -6 l-10 4Z" fill="#fff" stroke="#2c5364" stroke-width="2"></path>
        <path d="M150 178 L208 110 L250 178"></path>
      </g>
      <g stroke="#CF4A2C" stroke-width="3" stroke-linecap="round">
        <line x1="138" y1="78" x2="138" y2="56"></line>
        <path d="M138 58 l20 6 l-20 8Z" fill="#CF4A2C"></path>
      </g>
      <path d="M96 178 q20 -20 38 -10 q18 10 36 -6" fill="none" stroke="#CF4A2C" stroke-width="2.5" stroke-dasharray="4,7" stroke-linecap="round"></path>
      <line x1="60" y1="178" x2="252" y2="178" stroke="#2c5364" stroke-width="3.5" stroke-linecap="round"></line>
      <circle cx="218" cy="74" r="13" fill="none" stroke="#EC9B5A" stroke-width="3"></circle>
    </svg>`,
  },
  group: {
    name: "Group Tours",
    gradient: "linear-gradient(160deg,#F3EEFB,#E2D7F4)",
    desc: "Travel with a curated crew of like-minded people. Solo-friendly, never lonely.",
    tags: ["Solo-friendly", "Community"],
    scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#6D4B9F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="150" cy="86" r="15"></circle>
        <path d="M128 168 q0 -34 22 -34 q22 0 22 34"></path>
        <circle cx="102" cy="100" r="13"></circle>
        <path d="M83 170 q0 -30 19 -30 q19 0 19 30"></path>
        <circle cx="198" cy="100" r="13"></circle>
        <path d="M179 170 q0 -30 19 -30 q19 0 19 30"></path>
        <line x1="66" y1="178" x2="234" y2="178" stroke-width="3.5"></line>
      </g>
      <g fill="#CF4A2C" stroke="none">
        <circle cx="126" cy="58" r="3.5"></circle>
        <circle cx="150" cy="48" r="3.5"></circle>
        <circle cx="174" cy="58" r="3.5"></circle>
      </g>
      <path d="M126 58 q24 -22 48 0" fill="none" stroke="#CF4A2C" stroke-width="2" stroke-dasharray="3,6" stroke-linecap="round"></path>
      <path d="M232 62 q8 0 8 8 q0 7 -8 14 q-8 -7 -8 -14 q0 -8 8 -8Z" fill="none" stroke="#6D4B9F" stroke-width="2.6"></path>
      <circle cx="232" cy="70" r="2.6" fill="#6D4B9F" stroke="none"></circle>
    </svg>`,
  },
};

// Generic fallback for any DB category that doesn't match a known template.
export const FALLBACK_TEMPLATE = {
  gradient: "linear-gradient(160deg,#F1F5F4,#DCE6E2)",
  desc: "Handpicked experiences curated by our team and independent hosts.",
  tags: [],
  scene: `<svg class="scene" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <g fill="none" stroke="#CF4A2C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M70 178 L138 88 L206 178"></path>
      <path d="M150 178 L208 120 L250 178"></path>
      <line x1="60" y1="178" x2="252" y2="178"></line>
      <circle cx="216" cy="80" r="13" stroke="#EC9B5A"></circle>
    </g>
  </svg>`,
};

// Map a DB category name to its template by keyword (case/space-insensitive).
// Map a DB category name to its template by keyword (case/space-insensitive).
export const matchTemplate = (categoryName) => {
  const n = (categoryName || "").toLowerCase().trim();
  if (n.includes("india")) return CATEGORY_TEMPLATES.india;
  if (n.includes("international")) return CATEGORY_TEMPLATES.international;
  if (n.includes("influencer")) return CATEGORY_TEMPLATES.influencer;
  if (n.includes("workshop")) return CATEGORY_TEMPLATES.workshops;
  if (n.includes("retreat")) return CATEGORY_TEMPLATES.retreats;
  if (n.includes("trek")) return CATEGORY_TEMPLATES.trekking;
  if (n.includes("group")) return CATEGORY_TEMPLATES.group;
  return FALLBACK_TEMPLATE;
};

export const DEFAULT_CATEGORIES = [
  { Category: "India" },
  { Category: "International" },
  { Category: "Influencer Trip" },
  { Category: "Workshops" },
  { Category: "Retreats" },
  { Category: "Trekking & Adventure" },
  { Category: "Group Tours" },
];

