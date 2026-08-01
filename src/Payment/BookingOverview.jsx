"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import { useCreateSecureOrderMutation, useConfirmBookingMutation } from "../services";
import Loading from "../SmallComponents/Loading";
import Toastify from "../SmallComponents/Tostify";
import { useSelector } from "react-redux";
import LoginModal from "../Modals/LoginModal";
import { fmtDueDate } from "../utils/balanceDue";
import Footer from "../Component/Footer";

// Brand tokens — kept consistent with the rest of the website
// (terracotta #CF4A2C, Inter body + Playfair display headings).
const ACCENT = "#CF4A2C";
const DISPLAY_FONT = "'Playfair Display','Playfair',serif";
const BODY_FONT = "'Inter',sans-serif";

const inr = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

// Layout, responsive seam, amount-card transitions and the walking stickman
// companion. Class names are namespaced (nt-/sm-) to avoid global collisions.
const TICKET_CSS = `
  .nt-cta { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
  .nt-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(205,72,42,.36); background: #B83F23; }
  .nt-amt { transition: border-color .16s ease, background .16s ease, box-shadow .16s ease; }
  .nt-amt:hover { border-color: ${ACCENT}; }
  .nt-back { transition: background .16s ease; }
  .nt-back:hover { background: #F4F4F5; }

  .nt-shell { min-height: 100vh; display: flex; flex-direction: column; text-align: left; }
  .nt-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: clamp(20px,3.5vw,48px); }
  .nt-ticket { width: 100%; max-width: 1060px; display: flex; border-radius: 26px; overflow: hidden; background: #FFFFFF; box-shadow: 0 30px 64px -28px rgba(60,42,28,.34); border: 1px solid #F4F4F5; }
  .nt-left { flex: 0 0 42%; position: relative; background: linear-gradient(155deg,#3F3F46,#27272A); padding: clamp(32px,3.5vw,46px); overflow: hidden; }
  .nt-right { flex: 1; padding: clamp(28px,3vw,44px); }
  .nt-seam { position: relative; width: 30px; flex: none; }
  .nt-seam-notch { position: absolute; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; border-radius: 50%; background: #FFFFFF; }
  .nt-seam-line { position: absolute; left: 50%; transform: translateX(-50%); top: 22px; bottom: 22px; border-left: 2px dashed #E4E4E7; }

  @media (max-width: 820px) {
    .nt-ticket { flex-direction: column; max-width: 520px; }
    .nt-left { flex: none; }
    .nt-seam { width: 100%; height: 30px; }
    .nt-seam-notch { left: auto; top: 50%; transform: translateY(-50%); }
    .nt-seam-notch.a { left: -15px; }
    .nt-seam-notch.b { right: -15px; left: auto; }
    .nt-seam-line { left: 22px; right: 22px; top: 50%; bottom: auto; transform: translateY(-50%); border-left: none; border-top: 2px dashed #E4E4E7; width: auto; }
  }

  /* ===== Stickman travel companion ===== */
  .sm-stage { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 150px; pointer-events: none; z-index: 1; }
  .sm-travel { animation: smTravel 18s ease-in-out infinite; }
  .sm-bob { animation: smBob 18s ease-in-out infinite; }
  .sm-breathe { animation: smBreathe 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .sm-leg-l { animation: smLegL 18s ease-in-out infinite; transform-box: fill-box; transform-origin: right top; }
  .sm-leg-r { animation: smLegR 18s ease-in-out infinite; transform-box: fill-box; transform-origin: left top; }
  .sm-head { animation: smHead 18s ease-in-out infinite; transform-box: fill-box; transform-origin: center bottom; }
  .sm-arm-reach { animation: smArmReach 18s ease-in-out infinite; transform-box: fill-box; transform-origin: left center; transform: rotate(12deg); }
  .sm-arm-near { animation: smArmNear 18s ease-in-out infinite; transform-box: fill-box; transform-origin: left center; transform: rotate(20deg); }
  .sm-face-side { opacity: 1; animation: smFaceSide 18s ease-in-out infinite; }
  .sm-face-front { opacity: 0; animation: smFaceFront 18s ease-in-out infinite; }
  .nt-cta-glow { animation: smCtaGlow 18s ease-in-out infinite; }

  @keyframes smTravel { 0%,7% { transform: translateX(0); } 38%,86% { transform: translateX(250px); } 100% { transform: translateX(0); } }
  @keyframes smBob {
    0%,7% { transform: translateY(0); } 12% { transform: translateY(-2px); } 17% { transform: translateY(0); } 22% { transform: translateY(-2px); }
    27% { transform: translateY(0); } 32% { transform: translateY(-2px); } 37%,86% { transform: translateY(0); }
    90% { transform: translateY(-2px); } 94% { transform: translateY(0); } 98% { transform: translateY(-2px); } 100% { transform: translateY(0); }
  }
  @keyframes smBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }
  @keyframes smLegL {
    0%,7% { transform: rotate(0); } 12% { transform: rotate(15deg); } 17% { transform: rotate(-15deg); } 22% { transform: rotate(15deg); }
    27% { transform: rotate(-15deg); } 32% { transform: rotate(15deg); } 37%,86% { transform: rotate(0); }
    90% { transform: rotate(-15deg); } 94% { transform: rotate(15deg); } 98% { transform: rotate(-8deg); } 100% { transform: rotate(0); }
  }
  @keyframes smLegR {
    0%,7% { transform: rotate(0); } 12% { transform: rotate(-15deg); } 17% { transform: rotate(15deg); } 22% { transform: rotate(-15deg); }
    27% { transform: rotate(15deg); } 32% { transform: rotate(-15deg); } 37%,86% { transform: rotate(0); }
    90% { transform: rotate(15deg); } 94% { transform: rotate(-15deg); } 98% { transform: rotate(8deg); } 100% { transform: rotate(0); }
  }
  @keyframes smHead { 0%,44% { transform: rotate(0); } 49%,84% { transform: rotate(6deg); } 88%,100% { transform: rotate(0); } }
  @keyframes smArmReach {
    0%,42% { transform: rotate(12deg) scaleX(1); }
    47% { transform: rotate(-3deg) scaleX(1.5); }
    50%,72% { transform: rotate(-2deg) scaleX(1.5); }
    75% { transform: rotate(-2deg) scaleX(1.62); }
    78% { transform: rotate(-2deg) scaleX(1.5); }
    81% { transform: rotate(-2deg) scaleX(1.62); }
    84% { transform: rotate(-2deg) scaleX(1.5); }
    88% { transform: rotate(12deg) scaleX(1); }
    100% { transform: rotate(12deg) scaleX(1); }
  }
  @keyframes smArmNear { 0%,42% { transform: rotate(20deg); } 50%,84% { transform: rotate(28deg); } 90%,100% { transform: rotate(20deg); } }
  @keyframes smFaceSide { 0%,46% { opacity: 1; } 50%,84% { opacity: 0; } 88%,100% { opacity: 1; } }
  @keyframes smFaceFront { 0%,46% { opacity: 0; } 50%,84% { opacity: 1; } 88%,100% { opacity: 0; } }
  @keyframes smCtaGlow {
    0%,45% { transform: translateY(0); filter: none; }
    50%,72% { transform: translateY(-2px); filter: drop-shadow(0 6px 14px rgba(224,113,47,.4)); }
    75% { transform: translateY(-3px); filter: drop-shadow(0 8px 18px rgba(224,113,47,.5)); }
    78% { transform: translateY(-2px); filter: drop-shadow(0 6px 14px rgba(224,113,47,.4)); }
    81% { transform: translateY(-3px); filter: drop-shadow(0 8px 18px rgba(224,113,47,.5)); }
    84% { transform: translateY(-2px); filter: drop-shadow(0 6px 14px rgba(224,113,47,.4)); }
    88%,100% { transform: translateY(0); filter: none; }
  }

  @media (max-width: 820px) { .sm-stage { display: none; } }
  @media (prefers-reduced-motion: reduce) {
    .sm-travel,.sm-bob,.sm-breathe,.sm-leg-l,.sm-leg-r,.sm-head,.sm-arm-reach,.sm-arm-near,.sm-face-side,.sm-face-front,.nt-cta-glow { animation: none !important; }
  }
`;

const BookingOverview = () => {
  const [openL, setOpenL] = useState(false);
  const toggelModelL = () => setOpenL(!openL);

  const { userDbData } = useSelector((store) => store.global);
  const navigate = useNavigate();
  const location = useLocation();

  const { paymentDetail, selectedBatch, selections, totalAmount, coupenDiscount, couponCode, batchIndex } =
    location.state || {};

  // ---------------------------------------------------------------------------
  // Pricing breakdown (display only — the SERVER is the source of truth for the
  // amount actually charged). Order: Base Price -> Discount -> GST -> Final Total.
  // ---------------------------------------------------------------------------
  const calculateBaseAmount = () => {
    let baseAmount = 0;
    if (selections?.quantities) {
      Object.entries(selections.quantities).forEach(([key, quantity]) => {
        if (quantity > 0) {
          const [sectionIndex, itemIndex] = key.split("-");
          const sectionData = JSON.parse(paymentDetail?.addsection || "[]");
          if (sectionData[sectionIndex]?.array?.[itemIndex]) {
            const item = sectionData[sectionIndex].array[itemIndex];
            baseAmount += quantity * (parseInt(item.TitlePrice) || 0);
          }
        }
      });
    }
    return baseAmount;
  };

  const baseAmount = calculateBaseAmount();
  const discountAmount = Number(coupenDiscount) || 0;
  // GST is charged on the discounted base (discount is applied BEFORE GST).
  const gstTax = baseAmount ? (baseAmount - discountAmount) * 0.05 : 0;

  // Transform the data to match expected structure
  const cardData = {
    numberOfTravelers: selections?.quantities
      ? Object.entries(selections.quantities)
          .filter(([key]) => key.startsWith("0-")) // Only count first section (CATEGORY)
          .reduce((sum, [, qty]) => sum + (qty || 0), 0)
      : 0,
    cardDate: {
      batchDate: selectedBatch?.startDate,
      endSelectDate: selectedBatch?.endDate,
      numberOfDays: selectedBatch?.days,
    },
    gstTax,
    cardSectionData: [],
  };

  if (selections?.quantities) {
    Object.entries(selections.quantities).forEach(([key, quantity]) => {
      if (quantity > 0) {
        const [sectionIndex, itemIndex] = key.split("-");
        const sectionData = JSON.parse(paymentDetail?.addsection || "[]");
        if (sectionData[sectionIndex]?.array?.[itemIndex]) {
          cardData.cardSectionData.push({
            ...sectionData[sectionIndex].array[itemIndex],
            quantity,
          });
        }
      }
    });
  }

  if (selections?.toggles) {
    selections.toggles.forEach((key) => {
      const [sectionIndex, itemIndex] = key.split("-");
      const sectionData = JSON.parse(paymentDetail?.addsection || "[]");
      if (sectionData[sectionIndex]?.array?.[itemIndex]) {
        cardData.cardSectionData.push({
          ...sectionData[sectionIndex].array[itemIndex],
          quantity: 1,
        });
      }
    });
  }

  const Total = totalAmount || 0;
  const firstPay = Number(paymentDetail?.firstBookingPrice || 0);
  const balance = Total - firstPay;

  // ---------------------------------------------------------------------------
  // Trip details (top stub of the ticket)
  // ---------------------------------------------------------------------------
  const formatRange = () => {
    const start = cardData?.cardDate?.batchDate;
    const end = cardData?.cardDate?.endSelectDate;
    if (!start || !end) return "—";
    const fmt = (d) =>
      new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const details = [
    { icon: <PlaceOutlinedIcon sx={{ fontSize: 15, color: ACCENT }} />, label: "Location", value: paymentDetail?.location || "—" },
    { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: ACCENT }} />, label: "Dates", value: formatRange() },
    { icon: <DirectionsWalkIcon sx={{ fontSize: 15, color: ACCENT }} />, label: "Travellers", value: cardData?.numberOfTravelers || 0 },
    { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 15, color: ACCENT }} />, label: "Duration", value: `${paymentDetail?.days || 0}D / ${paymentDetail?.nights || 0}N` },
    { icon: <SwapHorizOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />, label: "Pick / Drop", value: `${paymentDetail?.pickUp || "—"} – ${paymentDetail?.dropOff || "—"}` },
  ];

  // ---------------------------------------------------------------------------
  // Payment line items — Base items first, then Discount, then GST.
  // ---------------------------------------------------------------------------
  const lineItems = cardData.cardSectionData.flat().map((item) => ({
    label: item?.Title,
    qty: `₹ ${inr(item?.TitlePrice)} × ${item.quantity}`,
    amount: `₹ ${inr(Number(item?.TitlePrice || 0) * item.quantity)}`,
    color: "#27272A",
  }));
  lineItems.push({
    label: "Discount",
    qty: "",
    amount: `– ₹ ${inr(discountAmount)}`,
    color: "#15803D",
  });
  lineItems.push({
    label: "GST @ 5%",
    qty: "",
    amount: `₹ ${inr(cardData.gstTax)}`,
    color: "#27272A",
  });

  // ---------------------------------------------------------------------------
  // Payment selection + order flow
  // ---------------------------------------------------------------------------
  const [paymentStatus, setPaymentStatus] = useState("fullPayment");
  const [selectedValue, setSelectedValue] = useState(Total);
  const partial = paymentStatus === "firstPayment";

  const [partialAvailable, setPartialAvailable] = useState(false);

  const pickFull = () => {
    setPaymentStatus("fullPayment");
    setSelectedValue(Total);
  };
  const pickPartial = () => {
    setPaymentStatus("firstPayment");
    setSelectedValue(firstPay);
  };

  const [loading] = useState(false);
  const [alertState, setAlertState] = useState({ open: false, message: "", severity: undefined });
  const showToast = (msg, type) => setAlertState({ open: true, message: msg, severity: type });

  const [createSecureOrder] = useCreateSecureOrderMutation();
  const [confirmBooking] = useConfirmBookingMutation();

  // Secure flow (C1/C2): the SERVER decides the amount and verifies the payment.
  // The browser only sends WHAT was chosen (trip + selections + coupon + batch),
  // never the price, and only the Razorpay receipt codes to confirm.
  const handleOrder = async (event) => {
    event.preventDefault();
    if (!userDbData) {
      setOpenL(true);
      return;
    }

    try {
      const so = await createSecureOrder({
        tripId: paymentDetail?._id,
        quantities: selections?.quantities || {},
        couponCode: couponCode || "",
        batchIndex,
        paymentType: paymentStatus === "firstPayment" ? "firstPayment" : "full",
      }).unwrap();

      if (!so?.orderId || !so?.key) {
        showToast("Payments are temporarily unavailable. Please try again later.", "error");
        return;
      }

      const options = {
        key: so.key, // provided by the server (no client-side key/test fallback)
        amount: so.amount * 100, // server-decided amount, in paise
        currency: so.currency || "INR",
        name: "Nomadic Townies",
        description: "Trip Booking Payment",
        image: "https://i.ibb.co/5Y3m33n/test.png",
        order_id: so.orderId,
        handler: async (response) => {
          try {
            const { data, message } = await confirmBooking({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            showToast(message || "Booking confirmed", "success");
            navigate("/paymentsuccess", { state: { data } });
          } catch (err) {
            console.error("confirmBooking failed:", err);
            showToast("Payment received but confirmation failed. Please contact support.", "error");
            navigate("/paymentfail");
          }
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", (resp) => {
        console.error("Payment failed:", resp?.error);
        navigate("/paymentfail");
      });
      rzp1.open();
    } catch (error) {
      console.error("createSecureOrder failed:", error);
      showToast("Could not start payment. Please try again.", "error");
      navigate("/paymentfail");
    }
  };

  // ----------------------- Check User Login -------------------------------
  useEffect(() => {
    if (!userDbData) setOpenL(true);
  }, [userDbData]);

  // ----------------------- Partial-payment window -------------------------
  // Book-now-pay-later is available until 15 days before the batch date,
  // and only when the trip has partial payment enabled (admin toggle;
  // legacy trips derive from a positive booking price).
  useEffect(() => {
    const enabled = paymentDetail?.partialPaymentEnabled !== false;
    if (enabled && cardData?.cardDate?.batchDate && firstPay > 0) {
      const cutoff = new Date(cardData.cardDate.batchDate);
      cutoff.setDate(cutoff.getDate() - 15);
      setPartialAvailable(cutoff > new Date());
    } else {
      setPartialAvailable(false);
    }
  }, [cardData?.cardDate?.batchDate, firstPay, paymentDetail?.partialPaymentEnabled]);

  // Keep the selected amount in sync with the recomputed total.
  useEffect(() => {
    if (!partial) setSelectedValue(Total);
  }, [Total, partial]);

  // Balance due = departure − 15 days (shared platform rule), not the
  // departure date itself.
  const balanceBy = fmtDueDate(cardData?.cardDate?.batchDate) || "—";

  // Selected amount-card styling helpers (plain style objects)
  const cardStyle = (active) => ({
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "14px",
    background: active ? "#FDF1EC" : "#FFFFFF",
    border: active ? `1.5px solid ${ACCENT}` : "1px solid #E4E4E7",
    boxShadow: active ? "0 6px 16px rgba(205,72,42,.16)" : "none",
    fontFamily: BODY_FONT,
  });

  const dotStyle = (active) => ({
    width: 19,
    height: 19,
    borderRadius: "50%",
    border: active ? `6px solid ${ACCENT}` : "2px solid #CDC4B5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "none",
  });

  return (
    <Box sx={{ background: "#FFFFFF", minHeight: "100vh" }}>
      <Loading isLoading={loading} />
      <Toastify setAlertState={setAlertState} alertState={alertState} />
      <LoginModal openL={openL} setOpenL={setOpenL} toggelModelL={toggelModelL} />
      <style>{TICKET_CSS}</style>

      <div className="nt-shell">
        {/* HEADER */}
        <header style={{ borderBottom: "1px solid #F4F4F5", background: "#FFFFFF", width: "100%" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(16px,2.2vw,22px) clamp(18px,4vw,48px)", display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              type="button"
              className="nt-back"
              aria-label="Go back"
              onClick={() => navigate(-1)}
              style={{
                width: 42,
                height: 42,
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #E4E4E7",
                background: "#FFFFFF",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "19px",
                color: "#18181B",
              }}
            >
              ←
            </button>
            <div
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: "clamp(18px,2vw,22px)",
                letterSpacing: "-.01em",
                color: "#18181B",
              }}
            >
              Booking Overview
            </div>
          </div>
        </header>

        {/* ===================== MAIN · CENTERED TICKET ===================== */}
        <main className="nt-main">
          <div className="nt-ticket">
            {/* LEFT · trip header */}
            <div className="nt-left">
              <div
                style={{
                  position: "absolute",
                  right: "-50px",
                  top: "-50px",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  background: "radial-gradient(circle,rgba(233,98,47,.32),transparent 66%)",
                }}
              />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ font: `700 12px/1 ${BODY_FONT}`, letterSpacing: ".2em", textTransform: "uppercase", color: "#D4D4D8" }}>
                    Your trip
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "6px 13px",
                      borderRadius: "99px",
                      background: "rgba(244,238,228,.12)",
                      border: "1px solid rgba(244,238,228,.22)",
                      font: `600 11px/1 ${BODY_FONT}`,
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                      color: "#FAFAFA",
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#15803D" }} />
                    Ready to book
                  </span>
                </div>

                <h1
                  style={{
                    margin: "18px 0 0",
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: "clamp(28px,3.4vw,40px)",
                    lineHeight: 1.05,
                    letterSpacing: "-.02em",
                    color: "#FAFAFA",
                    textWrap: "balance",
                  }}
                >
                  {paymentDetail?.title || "Your trip"}
                </h1>

                <div style={{ height: 1, background: "rgba(244,238,228,.16)", margin: "26px 0" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 18px" }}>
                  {details.map((d, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "7px", font: `600 11px/1 ${BODY_FONT}`, letterSpacing: ".08em", textTransform: "uppercase", color: "#71717A" }}>
                        {d.icon}
                        {d.label}
                      </span>
                      <span style={{ font: `600 16px/1.2 ${BODY_FONT}`, color: "#FAFAFA" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* stickman travel companion */}
              <svg className="sm-stage" viewBox="0 0 360 150" preserveAspectRatio="xMidYMax meet" fill="none" stroke="#FAFAFA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="20" y1="121" x2="340" y2="121" stroke="rgba(248,244,237,.18)" strokeWidth="1.5" strokeDasharray="2 7" />
                <g className="sm-travel">
                  <g className="sm-bob">
                    <g transform="translate(60,118)">
                      <path className="sm-leg-l" d="M0,-29 L-8,0" vectorEffect="non-scaling-stroke" />
                      <path className="sm-leg-r" d="M0,-29 L8,0" vectorEffect="non-scaling-stroke" />
                      <g className="sm-breathe">
                        <path d="M-3,-55 C-16,-52 -16,-33 -4,-30" stroke="#E0712F" vectorEffect="non-scaling-stroke" />
                        <path d="M-13,-44 L-4,-44" stroke="#E0712F" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        <circle cx="-9" cy="-44" r="1.4" fill="#FAFAFA" stroke="none" />
                        <path d="M0,-29 L0,-56" vectorEffect="non-scaling-stroke" />
                        <g className="sm-arm-reach"><path d="M0,-52 L22,-52" vectorEffect="non-scaling-stroke" /><path d="M22,-52 l4,-2.5 M22,-52 l4,2.5" vectorEffect="non-scaling-stroke" /></g>
                        <g className="sm-arm-near"><path d="M0,-52 L13,-45" vectorEffect="non-scaling-stroke" /></g>
                        <g className="sm-head">
                          <path d="M0,-56 L0,-61" vectorEffect="non-scaling-stroke" />
                          <circle cx="0" cy="-70.5" r="9.5" vectorEffect="non-scaling-stroke" />
                          <g className="sm-face-side">
                            <circle cx="3.6" cy="-72" r="0.95" fill="#FAFAFA" stroke="none" />
                            <circle cx="6.8" cy="-72" r="0.95" fill="#FAFAFA" stroke="none" />
                            <path d="M3,-66.4 Q6,-63.8 9,-66.4" vectorEffect="non-scaling-stroke" />
                          </g>
                          <g className="sm-face-front">
                            <circle cx="-3.2" cy="-72" r="0.95" fill="#FAFAFA" stroke="none" />
                            <circle cx="3.2" cy="-72" r="0.95" fill="#FAFAFA" stroke="none" />
                            <path d="M-4,-66.4 Q0,-63 4,-66.4" vectorEffect="non-scaling-stroke" />
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>

            {/* SEAM */}
            <div className="nt-seam">
              <div className="nt-seam-notch a" style={{ top: "-15px" }} />
              <div className="nt-seam-notch b" style={{ bottom: "-15px" }} />
              <div className="nt-seam-line" />
            </div>

            {/* RIGHT · payment */}
            <div className="nt-right">
              <div style={{ font: `700 12px/1 ${BODY_FONT}`, letterSpacing: ".14em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "6px" }}>
                Payment summary
              </div>

              {lineItems.map((li, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", padding: "14px 0", borderBottom: "1px solid #EFE7DA" }}>
                  <span style={{ flex: 1, font: `600 15px/1.3 ${BODY_FONT}`, color: "#27272A" }}>{li.label}</span>
                  <span style={{ font: `400 14px/1.3 ${BODY_FONT}`, color: "#A1A1AA", whiteSpace: "nowrap" }}>{li.qty}</span>
                  <span style={{ minWidth: 100, font: `600 15px/1.3 ${BODY_FONT}`, color: li.color, textAlign: "right", whiteSpace: "nowrap" }}>{li.amount}</span>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", marginTop: "16px", padding: "18px 20px", background: "linear-gradient(135deg,#F3F3F3,#EDEDED)", border: "1px solid #E2E2E2", borderRadius: "14px" }}>
                <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: "clamp(17px,2vw,20px)", color: "#27272A" }}>Total Trip Amount</span>
                <span style={{ fontFamily: BODY_FONT, fontWeight: 800, fontSize: "clamp(19px,2.4vw,24px)", color: "#18181B" }}>₹ {inr(Total)}</span>
              </div>

              {partialAvailable && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between", marginTop: "14px", padding: "15px 18px", background: "#FAFAFA", border: "1px dashed #E0CFBE", borderRadius: "14px" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ font: `600 15px/1.3 ${BODY_FONT}`, color: "#27272A" }}>Book now, pay the rest later</div>
                    <div style={{ marginTop: "5px", font: `400 13px/1.45 ${BODY_FONT}`, color: "#71717A" }}>
                      ₹ {inr(balance)} due by <strong style={{ color: "#3F3F46" }}>{balanceBy}</strong>
                    </div>
                  </div>
                  <div style={{ fontFamily: BODY_FONT, fontWeight: 800, fontSize: "clamp(18px,2vw,22px)", color: "#15803D", whiteSpace: "nowrap" }}>₹ {inr(firstPay)}</div>
                </div>
              )}

              <div style={{ font: `700 12px/1 ${BODY_FONT}`, letterSpacing: ".14em", textTransform: "uppercase", color: "#A1A1AA", margin: "22px 0 12px" }}>
                Select amount
              </div>

              <div style={{ display: "grid", gridTemplateColumns: partialAvailable ? "1fr 1fr" : "1fr", gap: "12px" }}>
                <button type="button" onClick={pickFull} className="nt-amt" style={cardStyle(!partial)}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ font: `600 12px/1 ${BODY_FONT}`, letterSpacing: ".04em", textTransform: "uppercase", color: "#71717A" }}>Full payment</span>
                    <span style={dotStyle(!partial)}><span style={{ width: 8, height: 8, borderRadius: "50%", background: !partial ? "#fff" : "transparent" }} /></span>
                  </span>
                  <span style={{ fontFamily: BODY_FONT, fontWeight: 800, fontSize: "21px", color: "#18181B" }}>₹ {inr(Total)}</span>
                  <span style={{ font: `400 12px/1.4 ${BODY_FONT}`, color: "#71717A" }}>Pay the whole amount today</span>
                </button>

                {partialAvailable && (
                  <button type="button" onClick={pickPartial} className="nt-amt" style={cardStyle(partial)}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ font: `600 12px/1 ${BODY_FONT}`, letterSpacing: ".04em", textTransform: "uppercase", color: "#71717A" }}>Partial</span>
                      <span style={dotStyle(partial)}><span style={{ width: 8, height: 8, borderRadius: "50%", background: partial ? "#fff" : "transparent" }} /></span>
                    </span>
                    <span style={{ fontFamily: BODY_FONT, fontWeight: 800, fontSize: "21px", color: "#18181B" }}>₹ {inr(firstPay)}</span>
                    <span style={{ font: `400 12px/1.4 ${BODY_FONT}`, color: "#71717A" }}>₹ {inr(balance)} payable later</span>
                  </button>
                )}
              </div>

              <div className="nt-cta-glow" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="nt-cta"
                  onClick={handleOrder}
                  style={{
                    width: "100%",
                    padding: "16px",
                    font: `700 16px/1 ${BODY_FONT}`,
                    letterSpacing: ".01em",
                    color: "#fff",
                    background: ACCENT,
                    border: "none",
                    borderRadius: "13px",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(205,72,42,.28)",
                  }}
                >
                  Proceed to Pay ₹ {inr(selectedValue)}
                </button>
              </div>
              <p style={{ margin: "12px 0 0", textAlign: "center", font: `400 12px/1.4 ${BODY_FONT}`, color: "#71717A" }}>
                🔒 You&apos;ll be redirected to the secure payment gateway
              </p>
              <p style={{ margin: "8px 0 0", textAlign: "center", font: `400 12px/1.5 ${BODY_FONT}`, color: "#71717A" }}>
                By proceeding, you agree to our{" "}
                <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}>
                  Terms &amp; Conditions
                </a>{" "}
                ,{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}>
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/cancellation-and-refund" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}>
                  Cancellation &amp; Refund Policy
                </a>
                .
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </Box>
  );
};

export default BookingOverview;
