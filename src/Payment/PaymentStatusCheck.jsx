"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLazyGetReconcileQuery, useGetPaymentStatusQuery } from "../services";

/**
 * PaymentStatusCheck — shown when the client could not confirm a payment it just
 * initiated (confirm callback failed / lost). It does NOT declare failure. It
 * reconciles against Razorpay's authoritative state via the server:
 *   PAYMENT_CONFIRMED → success · PAYMENT_FAILED → fail page ·
 *   PENDING / STATUS_UNKNOWN (after retries) → a safe "we're verifying, do NOT
 *   pay again" screen with a reference and a support/WhatsApp route.
 * Never asks the user to pay again while a charge might have succeeded.
 */
const DELAYS_MS = [0, 3000, 6000, 10000, 15000]; // a few bounded retries w/ backoff

const PaymentStatusCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, bookingRef, tripName } = location?.state || {};
  const [trigger] = useLazyGetReconcileQuery();
  const { data: payStatus } = useGetPaymentStatusQuery();

  const [phase, setPhase] = useState("checking"); // checking | unresolved | error
  const attempt = useRef(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!orderId) { setPhase("error"); return; }
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await trigger(orderId).unwrap();
        if (cancelled) return;
        if (res?.state === "PAYMENT_CONFIRMED") {
          navigate("/paymentsuccess", { state: { data: res.data }, replace: true });
          return;
        }
        if (res?.state === "PAYMENT_FAILED") {
          navigate("/paymentfail", { replace: true });
          return;
        }
        // PENDING / STATUS_UNKNOWN → keep polling until we run out of attempts.
      } catch {
        // network error on the reconcile call itself → treat as unresolved, retry
      }
      attempt.current += 1;
      if (attempt.current < DELAYS_MS.length) {
        timer.current = setTimeout(poll, DELAYS_MS[attempt.current]);
      } else {
        setPhase("unresolved");
      }
    };

    timer.current = setTimeout(poll, DELAYS_MS[0]);
    return () => { cancelled = true; if (timer.current) clearTimeout(timer.current); };
  }, [orderId, trigger, navigate]);

  const wa = `${payStatus?.whatsapp || ""}`.replace(/[^\d]/g, "");
  // Deliberately NO order/booking ref in the link (no sensitive ids in WhatsApp).
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        `Hi Nomadic Townies, I need help confirming a payment I just made${tripName ? ` for ${tripName}` : ""}.`
      )}`
    : null;

  const Box = ({ children }) => (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px", fontFamily: "var(--inter)", color: "var(--ink-800,#3C3228)" }}>
      {children}
    </div>
  );

  if (phase === "checking") {
    return (
      <Box>
        <div role="status" aria-live="polite" style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, margin: "0 auto 18px", borderRadius: "50%",
            border: "3px solid var(--line,#E6DDCF)", borderTopColor: "var(--brand-600,#CF4A2C)",
            animation: "nt-spin 0.9s linear infinite",
          }} />
          <h1 style={{ fontFamily: "var(--playfair)", fontSize: 24, margin: "0 0 10px" }}>Verifying your payment…</h1>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-700,#5A5247)" }}>
            Please keep this page open. <strong>Do not pay again</strong> — if your payment went through,
            your booking will be confirmed automatically.
          </p>
          <style>{`@keyframes nt-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Box>
    );
  }

  // unresolved / error — safe, non-failure messaging.
  return (
    <Box>
      <div role="status" aria-live="polite" style={{
        border: "1px solid var(--line,#E6DDCF)", background: "var(--surface-soft,#FBF6EE)",
        borderRadius: 16, padding: "24px 22px",
      }}>
        <h1 style={{ fontFamily: "var(--playfair)", fontSize: 22, margin: "0 0 10px" }}>
          We&apos;re confirming your payment
        </h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-700,#5A5247)", margin: "0 0 14px" }}>
          Your payment is being verified with our provider. <strong>Please don&apos;t try to pay again</strong> —
          if it succeeded, it will appear in <b>My Trips</b> shortly and you&apos;ll get a confirmation email.
          If anything was charged and not confirmed, our team will sort it out.
        </p>
        {bookingRef && (
          <p style={{ fontSize: 13, color: "var(--ink-600,#726A5E)", margin: "0 0 16px" }}>
            Reference: <b style={{ userSelect: "all" }}>{bookingRef}</b> — keep this handy if you contact us.
          </p>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => navigate("/profile")} style={{
            background: "var(--brand-600,#CF4A2C)", color: "#fff", border: "none", borderRadius: 999,
            padding: "12px 20px", fontWeight: 700, fontSize: 14, minHeight: 44, cursor: "pointer",
          }}>Go to My Trips</button>
          {waHref ? (
            <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
              border: "1.5px solid var(--brand-600,#CF4A2C)", color: "var(--brand-600,#CF4A2C)",
              borderRadius: 999, padding: "12px 20px", fontWeight: 700, fontSize: 14, minHeight: 44,
              display: "inline-flex", alignItems: "center", textDecoration: "none",
            }}>Chat on WhatsApp</a>
          ) : (
            <a href="mailto:hello@nomadictownies.com?subject=Payment%20verification%20help" style={{
              border: "1.5px solid var(--brand-600,#CF4A2C)", color: "var(--brand-600,#CF4A2C)",
              borderRadius: 999, padding: "12px 20px", fontWeight: 700, fontSize: 14, minHeight: 44,
              display: "inline-flex", alignItems: "center", textDecoration: "none",
            }}>Contact support</a>
          )}
        </div>
      </div>
    </Box>
  );
};

export default PaymentStatusCheck;
