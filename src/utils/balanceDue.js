// Platform rule: partial-payment balance is due 15 days before departure.
// Single source — use everywhere a due date is shown or calculated.
export const BALANCE_DUE_DAYS_BEFORE = 15;

export const balanceDueDate = (departure) => {
  if (!departure) return null;
  const d = new Date(departure);
  if (isNaN(d)) return null;
  d.setDate(d.getDate() - BALANCE_DUE_DAYS_BEFORE);
  return d;
};

export const fmtDueDate = (departure) => {
  const d = balanceDueDate(departure);
  return d
    ? d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "";
};
