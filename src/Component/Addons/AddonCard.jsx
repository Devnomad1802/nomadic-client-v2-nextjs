"use client";

/* eslint-disable react/prop-types */
/**
 * AddonCard — the single reusable card for any Booking Add-on (insurance,
 * pickup, gear…). Renders the add-on's shape, never a specific service, so new
 * add-ons need no new UI. Used in checkout selection now; success / My Bookings
 * reuse it in read-only modes later.
 *
 * props:
 *  - addon: { _id, type, title, tagline, provider{name,verified}, features[],
 *             plans[{planId,label,summary,price}], selection }
 *  - selectedPlanId: currently chosen plan id (or "")
 *  - onSelect(planId): toggle a plan (pass "" to clear)
 *  - inr(n): rupee formatter from the host page
 */
const clay = "#CF4A2C";
const ShieldSvg = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 6v6c0 5.2 3.4 9.3 8 10 4.6-.7 8-4.8 8-10V6l-8-4Z" /><path d="m9 12 2 2 4-4" />
  </svg>
);

const AddonCard = ({ addon, selectedPlanId = "", onSelect, inr = (n) => n }) => {
  if (!addon) return null;
  const plans = Array.isArray(addon.plans) ? addon.plans : [];
  const provider = addon.provider || {};
  const features = Array.isArray(addon.features) ? addon.features : [];

  return (
    <div style={{ border: "1px solid #E6DDCF", borderRadius: 16, background: "#fff", overflow: "hidden", boxShadow: "0 1px 2px rgba(28,26,23,.05),0 8px 22px -12px rgba(28,26,23,.14)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "16px 16px 10px" }}>
        <span style={{ flex: "none", width: 42, height: 42, borderRadius: 11, background: "#F7E7E0", color: clay, display: "grid", placeItems: "center" }}><ShieldSvg /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: "700 15.5px/1.2 'Hanken Grotesk',sans-serif", color: "#221C17" }}>{addon.title || "Add-on"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, font: "500 12px/1.3 'Hanken Grotesk',sans-serif", color: "#6E6A63", flexWrap: "wrap" }}>
            {addon.tagline || (provider.name ? `by ${provider.name}` : "")}
            {provider.name && <span style={{ color: "#3C3228", fontWeight: 700 }}>{provider.name}</span>}
            {provider.verified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: "700 10px/1 'Hanken Grotesk'", color: "#2E7D4F", background: "#E4F1E9", padding: "3px 7px", borderRadius: 99 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2Z" /></svg> Verified partner
              </span>
            )}
          </div>
        </div>
      </div>

      {features.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 16px 12px" }}>
          {features.map((f) => (
            <span key={f} style={{ font: "600 11px/1 'Hanken Grotesk'", color: "#3C3228", background: "#F3EFE8", borderRadius: 99, padding: "5px 9px" }}>{f}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px 14px" }}>
        {plans.map((p) => {
          const sel = selectedPlanId === p.planId;
          return (
            <button
              key={p.planId}
              type="button"
              onClick={() => onSelect?.(sel ? "" : p.planId)}
              aria-pressed={sel}
              style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", border: `1.5px solid ${sel ? clay : "#E6DDCF"}`, borderRadius: 12, padding: 12, cursor: "pointer", background: sel ? "#F7E7E0" : "#fff", transition: "border-color .15s, background .15s" }}
            >
              <span style={{ flex: "none", width: 19, height: 19, borderRadius: "50%", border: `2px solid ${sel ? clay : "#D8CFC0"}`, display: "grid", placeItems: "center" }}>
                {sel && <span style={{ width: 9, height: 9, borderRadius: "50%", background: clay }} />}
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", font: "700 14px/1.2 'Hanken Grotesk'", color: "#221C17" }}>{p.label}</span>
                {p.summary && <span style={{ display: "block", font: "500 11.5px/1.3 'Hanken Grotesk'", color: "#6E6A63", marginTop: 1 }}>{p.summary}</span>}
              </span>
              <span style={{ font: "800 15px/1 'Hanken Grotesk'", color: "#221C17", fontVariantNumeric: "tabular-nums" }}>₹{inr(p.price)}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid #EBE5DC", background: "#FAF8F4" }}>
        <span style={{ font: "600 11px/1.3 'Hanken Grotesk'", color: "#6E6A63" }}>🔒 Optional · issued instantly to your email · removable until you pay</span>
      </div>
    </div>
  );
};

export default AddonCard;
