"use client";

/* eslint-disable react/prop-types */
import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../Component/Footer";

// Brand tokens — consistent with the rest of the website
// (terracotta #CF4A2C, Inter body + Playfair display headings).
const ACCENT = "#CF4A2C";
const DISPLAY_FONT = "'Playfair Display','Playfair',serif";
const BODY_FONT = "'Inter',sans-serif";

const inr = (n) => Math.round(Number(n) || 0).toLocaleString("en-IN");

// Layout (two-column grid + sticky summary) and small interaction states.
const PAGE_CSS = `
  .bs-page { font-family: ${BODY_FONT}; text-align: left; }
  .bs-in::placeholder { color: #A1A1AA; }
  .bs-in:focus { border-color: ${ACCENT} !important; box-shadow: 0 0 0 4px rgba(205,72,42,.12); background: #FFFFFF; }
  .bs-chip { transition: background .15s ease, color .15s ease; }
  .bs-row { transition: background .18s ease, border-color .18s ease; }
  .bs-row:hover { background: #FAFAFA; }
  .bs-step { transition: background .14s ease, transform .12s ease; }
  .bs-step:hover:not(:disabled) { background: #F4F4F5; }
  .bs-step:active:not(:disabled) { transform: scale(.92); }
  .bs-step:disabled { opacity: .4; cursor: not-allowed; }
  .bs-cta { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
  .bs-cta:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(205,72,42,.32); background: #B83F23; }
  .bs-nav { transition: background .15s ease; }
  .bs-nav:hover { background: #F4F4F5; }
  .bs-main { display: grid; grid-template-columns: 1fr; gap: clamp(20px,2.5vw,28px); align-items: start; }
  @media (min-width: 940px) { .bs-main.two { grid-template-columns: minmax(0,1fr) 360px; } }
  @media (max-width: 939px) { .bs-aside { position: static !important; } }
`;

const CalendarIcon = ({ stroke = ACCENT, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
);
const TravellersIcon = ({ stroke = ACCENT, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c0-3 2.8-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M17.6 19c0-2.2-1-3.9-2.6-4.7" />
  </svg>
);

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { paymentDetail } = location.state || {};

  // Parse JSON data
  const selectDate = JSON.parse(paymentDetail?.selectDate || "[]");
  const endSelectDate = JSON.parse(paymentDetail?.endSelectDate || "[]");
  const numberOfDays = JSON.parse(paymentDetail?.numberOfDays || "[]");
  const numberOfSeats = JSON.parse(paymentDetail?.numberOfSeats || "[]");
  const discount = JSON.parse(paymentDetail?.discount || "[]");
  const AddSection = useMemo(
    () => JSON.parse(paymentDetail?.addsection || "[]"),
    [paymentDetail?.addsection]
  );

  // State management
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponBad, setCouponBad] = useState(false);
  const [selections, setSelections] = useState({ quantities: {} });

  // Generate batch data (only current/future batches)
  const generateBatchData = () => {
    const batches = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    selectDate.forEach((dateObj, index) => {
      const startDate = new Date(dateObj.BatchDate);
      const endDate = new Date(endSelectDate[index]?.EndBatchDate);
      if (Number.isNaN(startDate.getTime()) || startDate < today) return;

      const monthName = startDate.toLocaleDateString("en-US", { month: "short" });
      batches.push({
        id: index,
        startDate,
        endDate,
        month: monthName,
        seatsLeft: numberOfSeats[index]?.batchSeats || 0,
        totalSeats: numberOfSeats[index]?.batchSeats || 0,
        days: numberOfDays[index]?.selectDays || 0,
      });
    });
    return batches;
  };

  const batchData = generateBatchData();

  const availableMonths = (() => {
    const monthSet = new Set();
    batchData.forEach((b) => monthSet.add(b.month));
    return ["All", ...Array.from(monthSet).sort()];
  })();

  // Calculate totals (base + travellers)
  const calculateTotals = () => {
    let totalAmount = 0;
    let totalTravelers = 0;

    if (AddSection && AddSection.length > 0 && AddSection[0].array) {
      AddSection[0].array.forEach((item, itemIndex) => {
        const optionId = `0-${itemIndex}`;
        const quantity = selections.quantities[optionId] || 0;
        const price = parseInt(item.TitlePrice) || 0;
        totalAmount += quantity * price;
        totalTravelers += quantity; // only first section counts travellers
      });
    }

    if (AddSection && AddSection.length > 1) {
      for (let sectionIndex = 1; sectionIndex < AddSection.length; sectionIndex++) {
        if (AddSection[sectionIndex].array) {
          AddSection[sectionIndex].array.forEach((item, itemIndex) => {
            const optionId = `${sectionIndex}-${itemIndex}`;
            const quantity = selections.quantities[optionId] || 0;
            const price = parseInt(item.TitlePrice) || 0;
            totalAmount += quantity * price;
          });
        }
      }
    }
    return { totalAmount, totalTravelers };
  };

  const { totalAmount, totalTravelers } = calculateTotals();

  // Pricing order: Base -> Discount -> GST -> Final. Discount is derived live
  // (10% when a valid coupon is applied), so it stays correct as quantities change.
  const coupenDiscount = couponApplied ? totalAmount * 0.1 : 0;
  const gstAmount = (totalAmount - coupenDiscount) * 0.05;
  const finalAmount = totalAmount - coupenDiscount + gstAmount;

  const filteredBatches =
    selectedMonth === "All" ? batchData : batchData.filter((b) => b.month === selectedMonth);

  // Handlers
  const handleQuantityChange = (optionId, change, itemTitle = "") => {
    setSelections((prev) => {
      const currentQty = prev.quantities[optionId] || 0;
      const sectionIndex = parseInt(optionId.split("-")[0]);
      let newQty;

      const isGroupItem = itemTitle.toLowerCase().includes("group");
      // Group items (first section): first click adds 5, then +/- 1, floor 0.
      if (sectionIndex === 0 && isGroupItem) {
        if (change > 0) newQty = currentQty === 0 ? 5 : currentQty + 1;
        else newQty = currentQty <= 5 ? 0 : currentQty - 1;
      } else {
        newQty = Math.max(0, currentQty + change);
      }

      return { ...prev, quantities: { ...prev.quantities, [optionId]: newQty } };
    });
  };

  // Flatten trip.discount the same way the server does: entries may be plain
  // strings OR JSON-array-strings like '["CODE"]'. Mismatch here silently broke
  // valid coupons. Mirrors couponCodes() in server controllers/Order.js.
  const couponCodes = (() => {
    const out = [];
    (Array.isArray(discount) ? discount : []).forEach((d) => {
      try {
        const p = JSON.parse(d);
        if (Array.isArray(p)) out.push(...p);
        else out.push(d);
      } catch {
        out.push(d);
      }
    });
    return out.map((c) => `${c}`.trim().toLowerCase()).filter(Boolean);
  })();

  const isValidCoupon = (code) => {
    const normalized = code?.trim().toLowerCase();
    if (!normalized) return false;
    return couponCodes.includes(normalized);
  };

  const handleCouponApply = () => {
    if (!couponCode.trim()) {
      setCouponApplied(false);
      setCouponBad(false);
      return;
    }
    const ok = isValidCoupon(couponCode);
    setCouponApplied(ok);
    setCouponBad(!ok);
  };

  const onCouponInput = (e) => {
    setCouponCode(e.target.value);
    setCouponApplied(false);
    setCouponBad(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Batch card range, e.g. "Jul 10 - Jul 16, 2026" (no duration).
  const formatBatchRange = (start, end) => {
    const s = formatDate(start);
    const e = formatDate(end);
    const yd = end instanceof Date ? end : new Date(end);
    const year = Number.isNaN(yd.getTime()) ? "" : `, ${yd.getFullYear()}`;
    if (!s && !e) return "";
    return `${s} - ${e}${year}`;
  };

  const selectedBatchObj =
    selectedBatch !== null ? batchData.find((b) => b.id === selectedBatch) : null;

  const canProceed = selectedBatchObj && totalTravelers > 0;

  const handleProceed = () => {
    if (!canProceed) return;
    navigate("/booking_overview", {
      state: {
        paymentDetail,
        selectedBatch: selectedBatchObj,
        selections,
        totalAmount: finalAmount,
        coupenDiscount,
        couponCode,
        batchIndex: selectedBatchObj?.id,
      },
    });
  };

  const couponMsg = couponApplied ? "Coupon applied — 10% off" : couponBad ? "Invalid coupon code" : "";
  const couponMsgColor = couponApplied ? "#15803D" : "#B42318";

  const sectionCardStyle = {
    background: "#FFFFFF",
    border: "1px solid #EFE7DA",
    borderRadius: "18px",
    padding: "clamp(20px,2.4vw,28px)",
    boxShadow: "0 1px 3px rgba(0,0,0,.04)",
  };
  const sectionH2Style = {
    margin: 0,
    fontFamily: DISPLAY_FONT,
    fontWeight: 700,
    fontSize: "clamp(18px,2.1vw,21px)",
    letterSpacing: "-.01em",
    color: "#18181B",
  };

  return (
    <div className="bs-page" style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      <Helmet>
        <title>Book Your Trip | Nomadic Townies</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <style>{PAGE_CSS}</style>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #F4F4F5", background: "#FFFFFF", width: "100%" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(16px,2.2vw,22px) clamp(16px,4vw,40px)", display: "flex", alignItems: "center", gap: "14px" }}>
          <button type="button" className="bs-nav" aria-label="Go back" onClick={() => navigate(-1)} style={{ width: 42, height: 42, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E4E4E7", background: "#FFFFFF", borderRadius: "12px", cursor: "pointer", fontSize: "19px", color: "#18181B" }}>←</button>
          <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: "clamp(18px,2vw,22px)", letterSpacing: "-.01em", color: "#18181B" }}>Book Your Trip</div>
        </div>
      </header>

      <main className="bs-main two" style={{ flex: 1, width: "100%", maxWidth: 1180, margin: "0 auto", padding: "clamp(20px,3vw,40px) clamp(16px,4vw,40px)" }}>
        {/* ============ LEFT COLUMN ============ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(18px,2.2vw,24px)", minWidth: 0 }}>
          {/* SELECT BATCH DATE */}
          <section style={sectionCardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ width: 34, height: 34, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "9px", background: "#F4F4F5", color: ACCENT }}>
                <CalendarIcon size={18} stroke="currentColor" />
              </span>
              <h2 style={sectionH2Style}>Select Batch Date</h2>
            </div>

            {/* month filter chips */}
            {availableMonths.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px", overflowX: "auto" }}>
                {availableMonths.map((m) => {
                  const active = selectedMonth === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      className="bs-chip"
                      onClick={() => { setSelectedMonth(m); setSelectedBatch(null); }}
                      style={{ flex: "none", padding: "8px 18px", border: "none", borderRadius: "99px", background: active ? ACCENT : "#F3EDE3", color: active ? "#ffffff" : "#6A6256", font: `600 14px/1 ${BODY_FONT}`, cursor: "pointer" }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            )}

            {/* batch list / empty */}
            {filteredBatches.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredBatches.map((b) => {
                  const sel = selectedBatch === b.id;
                  const lowSeats = b.seatsLeft <= 3;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className="bs-row"
                      onClick={() => setSelectedBatch(b.id)}
                      style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left", padding: "15px 18px", border: sel ? `1.5px solid ${ACCENT}` : "1px solid #E4E4E7", borderRadius: "14px", background: sel ? "#FDF1EC" : "#FFFFFF", cursor: "pointer" }}
                    >
                      <span style={{ width: 21, height: 21, flex: "none", borderRadius: "50%", border: sel ? `6px solid ${ACCENT}` : "2px solid #CDC4B5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: sel ? "#ffffff" : "transparent" }} />
                      </span>
                      <span style={{ flex: 1, font: `600 16px/1.25 ${BODY_FONT}`, color: "#18181B" }}>
                        {formatBatchRange(b.startDate, b.endDate)}
                      </span>
                      <span style={{ font: `700 13px/1 ${BODY_FONT}`, color: lowSeats ? "#B42318" : ACCENT, whiteSpace: "nowrap" }}>
                        {b.seatsLeft} Seats Left / {b.totalSeats}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "34px 16px" }}>
                <div style={{ width: 48, height: 48, margin: "0 auto", borderRadius: "50%", background: "#F3EDE3", color: "#A1A1AA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>▦</div>
                <p style={{ margin: "14px 0 0", font: `600 15px/1.4 ${BODY_FONT}`, color: "#27272A" }}>No batches available</p>
                <p style={{ margin: "5px 0 0", font: `400 13px/1.4 ${BODY_FONT}`, color: "#71717A" }}>
                  There are no open departures for {selectedMonth === "All" ? "any month" : selectedMonth} right now.
                </p>
              </div>
            )}
          </section>

          {/* CATEGORY / add-on sections */}
          {AddSection && AddSection.length > 0 && AddSection.map((section, sectionIndex) => {
            if (!section?.array || section.array.length === 0) return null;
            return (
              <section key={sectionIndex} style={sectionCardStyle}>
                <h2 style={{ ...sectionH2Style, marginBottom: "18px" }}>
                  {section.sectionTitle || (sectionIndex === 0 ? "Category" : "Add-ons")}
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: "12px", padding: "0 6px 12px", borderBottom: "1px solid #F4F4F5" }}>
                  <span style={{ font: `700 12px/1 ${BODY_FONT}`, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA" }}>Type</span>
                  <span style={{ font: `700 12px/1 ${BODY_FONT}`, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA" }}>Price / person</span>
                  <span style={{ font: `700 12px/1 ${BODY_FONT}`, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA", textAlign: "center" }}>Qty</span>
                </div>

                {section.array.map((item, itemIndex) => {
                  const optionId = `${sectionIndex}-${itemIndex}`;
                  const qty = selections.quantities[optionId] || 0;
                  return (
                    <div key={optionId} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", alignItems: "center", gap: "12px", padding: "16px 6px", borderBottom: "1px solid #F7F1E8" }}>
                      <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: "16px", color: "#18181B" }}>{item.Title}</span>
                      <span style={{ font: `600 16px/1 ${BODY_FONT}`, color: "#27272A" }}>₹ {inr(item.TitlePrice)}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px", border: "1px solid #E4E4E7", borderRadius: "99px" }}>
                        <button type="button" className="bs-step" disabled={qty === 0} onClick={() => handleQuantityChange(optionId, -1, item.Title)} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: "50%", background: "transparent", color: "#71717A", fontSize: "17px", cursor: "pointer" }}>−</button>
                        <span style={{ minWidth: 24, textAlign: "center", font: `700 15px/1 ${BODY_FONT}`, color: "#18181B" }}>{qty}</span>
                        <button type="button" className="bs-step" onClick={() => handleQuantityChange(optionId, 1, item.Title)} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: "50%", background: "transparent", color: ACCENT, fontSize: "17px", cursor: "pointer" }}>+</button>
                      </span>
                    </div>
                  );
                })}
                {sectionIndex === 0 && (
                  <p style={{ margin: "14px 6px 0", font: `400 12px/1.5 ${BODY_FONT}`, color: "#71717A" }}>Group rate applies to bookings of 5 or more travellers.</p>
                )}
              </section>
            );
          })}
        </div>

        {/* ============ RIGHT · AMOUNT TO PAY ============ */}
        <aside className="bs-aside" style={{ background: "#FFFFFF", border: "1px solid #EFE7DA", borderRadius: "18px", padding: "clamp(22px,2.4vw,28px)", boxShadow: "0 8px 24px -12px rgba(60,42,28,.18)", position: "sticky", top: 96 }}>
          <h2 style={{ margin: "0 0 22px", fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: "clamp(19px,2.2vw,23px)", letterSpacing: "-.01em", color: "#18181B" }}>Amount to Pay</h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "13px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "9px", font: `500 14px/1 ${BODY_FONT}`, color: "#71717A" }}><CalendarIcon size={16} /> Selected Date</span>
            <span style={{ font: `600 14px/1.3 ${BODY_FONT}`, color: selectedBatchObj ? "#27272A" : "#A1A1AA", textAlign: "right" }}>
              {selectedBatchObj ? `${formatDate(selectedBatchObj.startDate)} - ${formatDate(selectedBatchObj.endDate)}` : "Not selected"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingBottom: "18px", marginBottom: "18px", borderBottom: "1px solid #F4F4F5" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "9px", font: `500 14px/1 ${BODY_FONT}`, color: "#71717A" }}><TravellersIcon size={16} /> No of Travellers</span>
            <span style={{ font: `600 15px/1 ${BODY_FONT}`, color: "#27272A" }}>{totalTravelers}</span>
          </div>

          <label style={{ display: "block", font: `600 12px/1 ${BODY_FONT}`, letterSpacing: ".04em", textTransform: "uppercase", color: "#71717A", marginBottom: "9px" }}>Apply coupon code</label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input className="bs-in" value={couponCode} onChange={onCouponInput} placeholder="Enter coupon code" style={{ width: "100%", padding: "12px 44px 12px 14px", fontSize: "15px", fontFamily: BODY_FONT, color: "#18181B", background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: "11px", outline: "none" }} />
            <button type="button" aria-label="Apply coupon" onClick={handleCouponApply} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: "#71717A", cursor: "pointer", fontSize: "15px" }}>⌕</button>
          </div>
          <div style={{ minHeight: 18, marginBottom: "18px" }}>
            <span style={{ font: `600 12px/1.3 ${BODY_FONT}`, color: couponMsgColor }}>{couponMsg}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "13px", paddingBottom: "16px", borderBottom: "1px solid #F4F4F5" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ font: `400 14px/1 ${BODY_FONT}`, color: "#3F3F46" }}>Amount</span><span style={{ font: `500 14px/1 ${BODY_FONT}`, color: "#27272A" }}>₹ {inr(totalAmount)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ font: `400 14px/1 ${BODY_FONT}`, color: "#3F3F46" }}>Discount</span><span style={{ font: `500 14px/1 ${BODY_FONT}`, color: "#15803D" }}>− ₹ {inr(coupenDiscount)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ font: `400 14px/1 ${BODY_FONT}`, color: "#3F3F46" }}>GST (5%)</span><span style={{ font: `500 14px/1 ${BODY_FONT}`, color: "#27272A" }}>₹ {inr(gstAmount)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ font: `600 14px/1 ${BODY_FONT}`, color: "#27272A" }}>Amount to Pay</span><span style={{ font: `600 14px/1 ${BODY_FONT}`, color: "#27272A" }}>₹ {inr(finalAmount)}</span></div>
          </div>

          <div style={{ textAlign: "center", padding: "18px 0 4px" }}>
            <span style={{ fontFamily: BODY_FONT, fontWeight: 800, fontSize: "clamp(28px,3.4vw,34px)", letterSpacing: "-.01em", color: "#18181B" }}>₹ {inr(finalAmount)}</span>
          </div>

          <button
            type="button"
            className="bs-cta"
            onClick={handleProceed}
            disabled={!canProceed}
            style={{ width: "100%", marginTop: "12px", padding: "16px", font: `700 16px/1 ${BODY_FONT}`, color: "#fff", background: canProceed ? ACCENT : "#E4E4E7", border: "none", borderRadius: "12px", cursor: canProceed ? "pointer" : "not-allowed", boxShadow: canProceed ? "0 8px 20px rgba(205,72,42,.28)" : "none" }}
          >
            Proceed to Payment
          </button>
          <p style={{ margin: "12px 0 0", textAlign: "center", font: `400 12px/1.4 ${BODY_FONT}`, fontStyle: "italic", color: "#71717A" }}>*You&apos;ll be redirected to the secure payment gateway</p>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
