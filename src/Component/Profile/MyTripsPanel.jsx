"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetPartialTripMutation,
  useCreateBalanceOrderMutation,
  useConfirmBalancePaymentMutation,
} from "../../services";
import { fmtDueDate } from "../../utils/balanceDue";
import { downloadInvoice } from "../../utils/invoiceDownload";

const PER_PAGE = 3;

const inr = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const safe = (v, f) => { try { return typeof v === "string" ? JSON.parse(v) : (v ?? f); } catch { return f; } };
const fmt = (d, withTime) => {
  if (!d) return "";
  const t = new Date(d);
  if (isNaN(t)) return "";
  const date = t.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (!withTime) return date;
  return `${date}, ${t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
};

// Only fully/partly PAID bookings belong in My Trips — drop abandoned "created" orders.
const statusOf = (s) =>
  s === "fullPayment" ? { label: "Booked", cls: "ok" }
  : s === "firstPayment" ? { label: "Partial booked", cls: "warn" }
  : null;

const MyTripsPanel = () => {
  const { userDbData } = useSelector((store) => store.global) || {};
  const navigate = useNavigate();
  const [getPartialTrip] = useGetPartialTripMutation();
  const [createBalanceOrder] = useCreateBalanceOrderMutation();
  const [confirmBalancePayment] = useConfirmBalancePaymentMutation();

  const [state, setState] = useState({ loading: true, error: false, list: [] });
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!userDbData?._id) { setState({ loading: false, error: false, list: [] }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));
    try {
      const res = await getPartialTrip({ userId: userDbData._id });
      const rows = res?.data?.data || [];
      const list = rows
        .map((b) => {
          const status = statusOf(b.paymentStatus);
          if (!status) return null; // skip unpaid/abandoned
          const pd = safe(b.paymentDetail, {});
          const cd = safe(b.cardData, {});
          const items = Array.isArray(cd?.cardSectionData) ? cd.cardSectionData : [];
          const itemTotal = items.reduce((s, it) => s + Number(it.TitlePrice || 0) * Number(it.quantity || 0), 0);
          const gst = Number(cd?.gstTax || 0);
          const discount = Number(b.coupenDiscount || 0);
          const paid = Number(b.total || 0);
          const fullTotal = Number(b.fullTripAmount || itemTotal + gst - discount);
          const remaining = Math.max(0, Math.round(fullTotal - paid));
          const a = fmt(cd?.cardDate?.batchDate);
          const end = cd?.cardDate?.endSelectDate;
          const dateRange = a && fmt(end) ? `${a} – ${fmt(end)}` : a || "Dates to be confirmed";
          return {
            _id: b._id, title: pd?.title || "Trip", location: pd?.location || "—",
            pickDrop: (pd?.pickUp || pd?.dropOff) ? `${pd?.pickUp || "—"} – ${pd?.dropOff || "—"}` : "—",
            travellers: cd?.numberOfTravelers || b.travellersCount || 1,
            dateRange, bookedOn: fmt(b.DateOfBooking, true),
            payByDate: fmtDueDate(cd?.cardDate?.batchDate), status,
            paid, remaining, gst, discount, itemTotal, items, couponCode: b.couponCode,
          };
        })
        .filter(Boolean);
      setState({ loading: false, error: false, list });
      setPage(1);
    } catch (e) {
      console.error("My Trips load failed:", e);
      setState({ loading: false, error: true, list: [] });
    }
  }, [getPartialTrip, userDbData]);

  useEffect(() => { load(); }, [load]);

  const pageCount = Math.max(1, Math.ceil(state.list.length / PER_PAGE));
  const pageItems = useMemo(
    () => state.list.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [state.list, page]
  );

  const payBalance = async (b) => {
    try {
      const so = await createBalanceOrder({ bookingId: b._id }).unwrap();
      if (!so?.orderId || !so?.key) return alert("Payments are temporarily unavailable. Please try again later.");
      const rzp = new window.Razorpay({
        key: so.key, amount: so.amount * 100, currency: so.currency || "INR",
        name: "Nomadic Townies", description: "Trip Balance Payment", order_id: so.orderId,
        handler: async (response) => {
          try {
            const { data } = await confirmBalancePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            navigate("/paymentsuccess", { state: { data } });
          } catch (err) { console.error(err); navigate("/paymentfail"); }
        },
      });
      rzp.on("payment.failed", (r) => { console.error(r?.error); navigate("/paymentfail"); });
      rzp.open();
    } catch (e) {
      console.error("balance order failed:", e);
      alert(e?.data?.error || "Could not start payment. Please try again.");
    }
  };

  if (state.loading) return <div className="nt-state">Loading your trips…</div>;
  if (state.error) return <div className="nt-state nt-state-err">Couldn&apos;t load your trips. <button className="nt-link" onClick={load}>Retry</button></div>;
  if (!state.list.length) return (
    <div className="nt-empty-box">
      <div className="nt-empty-ic">⛰</div>
      <div className="nt-empty-t">No bookings yet</div>
      <p>When you book an experience it&apos;ll show up here.</p>
      <button className="nt-cta nt-cta-sm" onClick={() => navigate("/experiences")}>Explore experiences</button>
    </div>
  );

  return (
    <div className="nt-bookings">
      {pageItems.map((b) => {
        const isOpen = open === b._id;
        return (
          <div className="nt-bk" key={b._id} data-open={isOpen}>
            <button className="nt-bk-head" onClick={() => setOpen(isOpen ? null : b._id)}>
              <span className="nt-bk-ttl">
                <span className="nt-bk-name">{b.title}</span>
                <span className="nt-bk-sub">Booked on {b.bookedOn || "—"}</span>
              </span>
              <span className="nt-bk-right">
                <span className={`nt-stat ${b.status.cls}`}>{b.status.label}</span>
                <span className="nt-caret">▾</span>
              </span>
            </button>

            {isOpen && (
              <div className="nt-bk-body">
                <div className="nt-bk-grid">
                  <div className="nt-bk-cell"><span className="nt-k">⌖ Location</span><span className="nt-v">{b.location}</span></div>
                  <div className="nt-bk-cell"><span className="nt-k">⛰ Travellers</span><span className="nt-v">{b.travellers} {b.travellers > 1 ? "travellers" : "traveller"}</span></div>
                  <div className="nt-bk-cell"><span className="nt-k">▦ Dates</span><span className="nt-v">{b.dateRange}</span></div>
                  <div className="nt-bk-cell"><span className="nt-k">⇄ Pick up / Drop off</span><span className="nt-v">{b.pickDrop}</span></div>
                </div>

                {/* boxed breakdown */}
                <div className="nt-li-box">
                  {b.items.map((li, i) => (
                    <div className="nt-li-row" key={i}>
                      <span>{li.Title}</span>
                      <span className="nt-li-qty">₹ {inr(li.TitlePrice)} × {li.quantity}</span>
                      <span>₹ {inr(Number(li.TitlePrice) * Number(li.quantity))}</span>
                    </div>
                  ))}
                  <div className="nt-li-row"><span>Amount paid</span><span /><span className="nt-green">− ₹ {inr(b.paid)}</span></div>
                  {b.discount > 0 && <div className="nt-li-row"><span>Discount{b.couponCode ? ` (${b.couponCode})` : ""}</span><span /><span className="nt-green">− ₹ {inr(b.discount)}</span></div>}
                  {b.gst > 0 && <div className="nt-li-row"><span>GST @ 5%</span><span /><span>₹ {inr(b.gst)}</span></div>}
                  <div className="nt-li-row nt-li-due"><span>Balance due</span><span /><span>₹ {inr(b.remaining)}</span></div>
                </div>

                <div className="nt-pay">
                  <div className="nt-pay-cell"><span>Amount paid</span><strong>₹ {inr(b.paid)}</strong></div>
                  <div className="nt-pay-cell"><span>Remaining to pay</span><strong className="nt-pay-rem">₹ {inr(b.remaining)}</strong></div>
                </div>

                {b.remaining > 0 && (
                  <div className="nt-balance">
                    <span>Balance of <strong>₹ {inr(b.remaining)}</strong>{b.payByDate ? <> is due by <strong>{b.payByDate}</strong></> : " is due before departure"}.</span>
                    <button className="nt-cta nt-cta-sm" onClick={() => payBalance(b)}>Proceed to pay ₹ {inr(b.remaining)}</button>
                  </div>
                )}

                <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="nt-policy" onClick={() => downloadInvoice(b._id)}>⬇ Download invoice</button>
                  <button className="nt-policy" onClick={() => navigate("/cancellation-and-refund")}>Cancellation policy</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {pageCount > 1 && (
        <div className="nt-pager">
          <button className="nt-pg-btn" disabled={page === 1} onClick={() => { setPage((p) => Math.max(1, p - 1)); setOpen(null); }}>‹ Prev</button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button key={n} className={`nt-pg-num ${n === page ? "on" : ""}`} onClick={() => { setPage(n); setOpen(null); }}>{n}</button>
          ))}
          <button className="nt-pg-btn" disabled={page === pageCount} onClick={() => { setPage((p) => Math.min(pageCount, p + 1)); setOpen(null); }}>Next ›</button>
        </div>
      )}
    </div>
  );
};

export default MyTripsPanel;
