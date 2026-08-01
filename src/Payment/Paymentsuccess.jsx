"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateBalanceOrderMutation, useConfirmBalancePaymentMutation } from "../services";
import { useGetTripsQuery } from "../services/TripApis";
import { fmtDueDate } from "../utils/balanceDue";
import { downloadInvoice } from "../utils/invoiceDownload";
import Footer from "../Component/Footer";

const inr = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const safeParse = (v, f) => { try { return typeof v === "string" ? JSON.parse(v) : (v ?? f); } catch { return f; } };
const fmt = (d, opts = { day: "numeric", month: "short" }) => {
  if (!d) return "";
  const t = new Date(d);
  return isNaN(t) ? "" : t.toLocaleDateString("en-IN", opts);
};

const Paymentsuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userDbData } = useSelector((store) => store.global) || {};
  const { data } = location?.state || {};
  const [paying, setPaying] = useState(false);
  const [createBalanceOrder] = useCreateBalanceOrderMutation();
  const [confirmBalancePayment] = useConfirmBalancePaymentMutation();
  const { data: tripsRes } = useGetTripsQuery();

  // Direct URL / refresh: no booking payload → home (booking lives in My Trips).
  useEffect(() => { if (!data) navigate("/"); }, [data, navigate]);
  if (!data) return null;

  // ── live booking snapshot — nothing hardcoded ──
  const pd = safeParse(data.paymentDetail, {});
  const cd = safeParse(data.cardData, { cardSectionData: [], cardDate: {}, gstTax: 0 });

  // Host comes from the booking snapshot; older snapshots may lack _id (or the
  // whole host), so fall back to the live trip's populated host.
  const liveTrip = (tripsRes?.data || []).find((t) => `${t?._id}` === `${pd?._id || data.tripId}`);
  const liveHost = liveTrip?.host && typeof liveTrip.host === "object" ? liveTrip.host : null;
  const snapHost = pd?.host || null;
  const host = snapHost || (liveHost && {
    name: liveHost.hostTitle || liveHost.hostName || "",
    bio: liveHost.shortBio || liveHost.tagline || "",
    verified: !!liveHost.isVerified,
    logo: liveHost.brandingLogo || null,
  }) || null;
  const hostChatId = snapHost?._id || (liveHost ? `${liveHost._id}` : null);

  const isPartial = data.paymentStatus === "firstPayment";
  const items = Array.isArray(cd?.cardSectionData) ? cd.cardSectionData : [];
  const subtotal = items.reduce((s, it) => s + Number(it.TitlePrice || 0) * Number(it.quantity || 0), 0);
  const fullTotal = Number(data.fullTripAmount || subtotal + Number(cd?.gstTax || 0) - Number(data.coupenDiscount || 0));
  const paid = Number(data.total || fullTotal);
  const remaining = isPartial ? Math.max(0, Math.round(fullTotal - paid)) : 0;

  const start = cd?.cardDate?.batchDate;
  const end = cd?.cardDate?.endSelectDate;
  const balanceBy = fmtDueDate(start); // departure − 15 days (platform rule)
  const travellers = Number(cd?.numberOfTravelers || data.travellersCount || 1);
  const firstName = (userDbData?.name || "Traveller").split(" ")[0];
  const email = userDbData?.email || "your registered email";
  const tripTitle = pd?.title || "Your trip";
  const bookingId = data.bookingId || data.razorpayOrderId || "—";
  const destination = pd?.location || "";

  const stats = [
    { label: "Batch", value: start && end ? `${fmt(start)}–${fmt(end)}` : fmt(start) || "TBC" },
    pd?.nights && pd?.days ? { label: "Duration", value: `${pd.nights}N · ${pd.days}D` } : null,
    { label: "Travellers", value: `${travellers} guest${travellers > 1 ? "s" : ""}` },
    { label: "Booking ID", value: bookingId },
    data.razorpayPaymentId ? { label: "Payment ref", value: data.razorpayPaymentId } : null,
  ].filter(Boolean);

  const openChat = () => { if (hostChatId) navigate(`/hosts/${hostChatId}?chat=1`); };
  const viewExperience = () => navigate(`/trips/${pd?.seoSlug || pd?._id || ""}`);

  // Pay the remaining balance right here (same secure flow as My Trips).
  const payBalance = async () => {
    if (paying || !data._id) return;
    setPaying(true);
    try {
      const so = await createBalanceOrder({ bookingId: data._id }).unwrap();
      if (!so?.orderId || !so?.key) throw new Error("no order");
      const rzp = new window.Razorpay({
        key: so.key, amount: so.amount * 100, currency: so.currency || "INR",
        name: "Nomadic Townies", description: "Trip Balance Payment", order_id: so.orderId,
        handler: async (response) => {
          try {
            const res = await confirmBalancePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            navigate("/paymentsuccess", { state: { data: res?.data }, replace: true });
          } catch { navigate("/paymentfail"); }
        },
      });
      rzp.on("payment.failed", () => navigate("/paymentfail"));
      rzp.open();
    } catch {
      navigate("/profile"); // fall back to My Trips pay flow
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="ps2">
      <style>{css}</style>
      <main className="ps2-main">
        {/* success header */}
        <div className="ps2-hero">
          <div className="ps2-check">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h1 className="ps2-h1">Payment successful — you&apos;re in!</h1>
          <p className="ps2-sub">
            Your ticket{destination ? ` to ${destination}` : ""} is confirmed, {firstName}. Save it, screenshot it, frame it.
          </p>
        </div>

        {/* THE TICKET */}
        <div className="ps2-ticket">
          <div className="ps2-top">
            <div className="ps2-glow" />
            <div style={{ position: "relative" }}>
              <div className="ps2-toprow">
                <span className="ps2-kicker">Booking confirmed</span>
                <span className="ps2-paid">✓ Paid ₹ {inr(paid)}</span>
              </div>
              <h2 className="ps2-trip">{tripTitle}</h2>
              <div className="ps2-stats">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="ps2-stat-k">{s.label}</div>
                    <div className="ps2-stat-v" style={s.label === "Payment ref" || s.label === "Booking ID" ? { fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" } : undefined}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* perforated seam */}
          <div className="ps2-seam">
            <div className="ps2-notch ps2-notch--l" />
            <div className="ps2-notch ps2-notch--r" />
            <div className="ps2-dash" />
          </div>

          {/* bottom stub */}
          <div className="ps2-stub">
            {host?.name && (
              <div className="ps2-hostrow">
                <div style={{ position: "relative", flex: "none" }}>
                  {host.logo
                    ? <img className="ps2-host-av ps2-host-av--img" src={host.logo} alt={host.name} />
                    : <div className="ps2-host-av">{host.name.charAt(0).toUpperCase()}</div>}
                  {host.verified && (
                    <span className="ps2-tick">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 170 }}>
                  <div className="ps2-hostedby">Hosted by</div>
                  <div className="ps2-hostname">{host.name}</div>
                  <div className="ps2-hostline">{host.bio || "Your host · will message you here with pickup details"}</div>
                </div>
                {hostChatId && (
                  <button type="button" className="ps-cta ps2-msg" onClick={openChat}>Message your host</button>
                )}
              </div>
            )}
            {remaining > 0 && (
              <div className="ps2-balance">
                <span className="ps2-balance-t">
                  Balance ₹ {inr(remaining)}{balanceBy ? <> due by <strong>{balanceBy}</strong></> : " due before departure"}
                </span>
                <span className="ps2-paylink" role="button" tabIndex={0} onClick={payBalance}>
                  {paying ? "Opening…" : "Pay balance →"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* actions */}
        <div className="ps2-actions">
          <button type="button" className="ps-cta ps2-primary" onClick={() => navigate("/profile")}>View booking →</button>
          <button type="button" className="ps-ghost ps2-ghost" onClick={() => downloadInvoice(data._id)}>⬇ Download invoice</button>
          <button type="button" className="ps-ghost ps2-ghost" onClick={() => navigate("/profile")}>Go to My Trips</button>
          <button type="button" className="ps-ghost ps2-ghost" onClick={viewExperience}>View experience</button>
          <button type="button" className="ps-ghost ps2-ghost" onClick={() => navigate("/experiences")}>Explore more experiences</button>
        </div>

        <p className="ps2-foot">Confirmation sent to {email} · all conversations stay on Nomadic Townies.</p>
      </main>
      <Footer />
    </div>
  );
};

const css = `
.ps2{background:#FAFAFA;min-height:100vh;font-family:'Hanken Grotesk','Inter',system-ui,sans-serif}
.ps2 *{box-sizing:border-box}
.ps2-main{width:100%;max-width:640px;margin:0 auto;padding:clamp(32px,5vw,52px) clamp(16px,4vw,24px) 56px}
.ps2-hero{text-align:center;margin-bottom:28px}
.ps2-check{width:66px;height:66px;margin:0 auto;border-radius:50%;background:#E0EFE4;display:flex;align-items:center;justify-content:center;animation:psPop .6s cubic-bezier(.22,.61,.36,1) both}
.ps2-h1{margin:16px 0 0;font-family:'Bricolage Grotesque','Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(26px,4.6vw,30px);letter-spacing:-.02em;color:#18181B}
.ps2-sub{margin:8px 0 0;font-size:15px;line-height:1.5;color:#52525B}
.ps2-ticket{filter:drop-shadow(0 20px 40px rgba(60,42,28,.24))}
.ps2-top{position:relative;background:linear-gradient(150deg,#3F3F46,#27272A);border-radius:20px 20px 0 0;padding:28px 30px;overflow:hidden}
.ps2-glow{position:absolute;right:-40px;top:-40px;width:170px;height:170px;border-radius:50%;background:radial-gradient(circle,rgba(233,98,47,.32),transparent 66%)}
.ps2-toprow{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ps2-kicker{font-weight:700;font-size:11px;line-height:1;letter-spacing:.2em;text-transform:uppercase;color:#D4D4D8}
.ps2-paid{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;background:rgba(91,191,122,.16);border:1px solid rgba(91,191,122,.4);font-weight:700;font-size:10px;line-height:1;letter-spacing:.05em;text-transform:uppercase;color:#A8E6BC}
.ps2-trip{margin:14px 0 0;font-family:'Bricolage Grotesque','Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(23px,4vw,27px);line-height:1.06;letter-spacing:-.02em;color:#FAFAFA}
.ps2-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:16px;margin-top:22px}
.ps2-stat-k{font-weight:600;font-size:10px;line-height:1;letter-spacing:.08em;text-transform:uppercase;color:#71717A}
.ps2-stat-v{margin-top:5px;font-weight:600;font-size:14px;line-height:1.2;color:#FAFAFA}
.ps2-seam{position:relative;height:28px;background:#27272A}
.ps2-notch{position:absolute;top:0;width:28px;height:28px;border-radius:50%;background:#FAFAFA}
.ps2-notch--l{left:-14px}.ps2-notch--r{right:-14px}
.ps2-dash{position:absolute;left:22px;right:22px;top:50%;transform:translateY(-50%);border-top:2px dashed rgba(244,238,228,.3)}
.ps2-stub{text-align:left;background:#FAFAFA;border:1px solid #E4E4E7;border-top:none;border-radius:0 0 20px 20px;padding:22px 30px}
.ps2-hostrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.ps2-host-av{width:54px;height:54px;border-radius:14px;background:linear-gradient(150deg,#CF4A2C,#CF4A2C);display:flex;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:21px;color:#FFFFFF}
.ps2-host-av--img{object-fit:cover}
.ps2-tick{position:absolute;right:-5px;bottom:-5px;width:20px;height:20px;border-radius:50%;background:#15803D;border:2px solid #FAFAFA;display:flex;align-items:center;justify-content:center;color:#fff}
.ps2-hostedby{font-weight:600;font-size:10.5px;line-height:1;letter-spacing:.08em;text-transform:uppercase;color:#A1A1AA}
.ps2-hostname{margin-top:4px;font-family:'Bricolage Grotesque','Playfair Display',Georgia,serif;font-weight:700;font-size:17px;color:#18181B}
.ps2-hostline{margin-top:2px;font-size:12px;line-height:1.4;color:#71717A}
.ps2-msg{flex:none;padding:11px 18px;font-weight:700;font-size:13px;line-height:1;color:#fff;background:#CF4A2C;border:none;border-radius:10px;cursor:pointer}
.ps2-balance{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px;padding-top:16px;border-top:1px dashed #E0CFBE;flex-wrap:wrap}
.ps2-balance-t{font-weight:500;font-size:13px;line-height:1.4;color:#9A6A2E}
.ps2-balance-t strong{color:#3F3F46}
.ps2-paylink{font-weight:700;font-size:13px;line-height:1;color:#CF4A2C;cursor:pointer;white-space:nowrap}
.ps2-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:26px}
.ps2-primary{padding:14px;font-weight:700;font-size:14px;line-height:1;color:#fff;background:#CF4A2C;border:none;border-radius:12px;cursor:pointer}
.ps2-ghost{padding:14px;font-weight:700;font-size:14px;line-height:1;color:#18181B;background:#FFFFFF;border:1px solid #E4E4E7;border-radius:12px;cursor:pointer}
.ps2-foot{margin:22px 0 0;text-align:center;font-size:12px;line-height:1.5;color:#71717A}
.ps-cta{transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
.ps-cta:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(207,74,44,.3);background:#C0421F}
.ps-ghost{transition:background .16s ease,border-color .16s ease}
.ps-ghost:hover{background:#FAFAFA;border-color:#CF4A2C}
@keyframes psPop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.ps2-check{animation:none}}
@media(max-width:480px){.ps2-actions{grid-template-columns:1fr}.ps2-top,.ps2-stub{padding-left:20px;padding-right:20px}}
`;

export default Paymentsuccess;
