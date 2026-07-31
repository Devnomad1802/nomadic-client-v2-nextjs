// ─────────────────────────────────────────────────────────────
// Central listing rules for trips. Every surface (homepage,
// View All Experiences, search…) must use these so a published
// trip can never be visible on one page and missing on another.
//
// Rules:
//  - Batch trips list while they still have a FUTURE departure;
//    they sort by their nearest upcoming batch date.
//  - Customized trips have no fixed dates (inquiry-based) — they
//    always list, after the dated trips, showing "Flexible dates".
// ─────────────────────────────────────────────────────────────
const SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const parse = (v, f) => { try { return typeof v === "string" ? JSON.parse(v) : (v ?? f); } catch { return f; } };

export const isCustomized = (t) => t?.type === "Customized";

// Future batch dates, soonest first.
export const batchDates = (t) => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return parse(t?.selectDate, [])
    .map((x) => x?.BatchDate && new Date(x.BatchDate))
    .filter((d) => d && !isNaN(d) && d >= now)
    .sort((a, b) => a - b);
};
export const nextDate = (t) => batchDates(t)[0] || null;
export const tripMonths = (t) => [...new Set(batchDates(t).map((d) => SHORT[d.getMonth()]))];

// Everything that belongs in a listing: dated-future batch trips
// (nearest first) then customized trips (flexible dates).
export const listableTrips = (list) => {
  const all = Array.isArray(list) ? list : [];
  return all
    .map((t) => ({ t, next: nextDate(t), custom: isCustomized(t) }))
    .filter((x) => x.next || x.custom)
    .sort((a, b) => (a.next?.getTime() ?? Infinity) - (b.next?.getTime() ?? Infinity))
    .map((x) => x.t);
};

// Card date label: real nearest departure, or the flexible tag.
export const dateLabel = (t, opts = { day: "2-digit", month: "short" }) => {
  const d = nextDate(t);
  if (d) return d.toLocaleDateString("en-IN", opts);
  return isCustomized(t) ? "Flexible dates" : null;
};
