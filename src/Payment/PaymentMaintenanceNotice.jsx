"use client";

import React from "react";

/**
 * PaymentMaintenanceNotice — shown in place of the "Proceed to Payment" action
 * while Payment Maintenance is ON. Truthful by design: it never implies a held
 * seat, confirmed price, guaranteed availability, or that payment happens over
 * WhatsApp. The WhatsApp deep link carries only non-identifying trip context
 * (name, public URL, batch dates, guest count) — no email, phone, order id, or
 * payment data.
 *
 * Props:
 *  - status:  { whatsapp, heading, body, ctaLabel }  (from GET /api/payment-status)
 *  - context: { tripName, tripUrl, batchDates, guests }
 *  - fallbackEmail: string (used when no WhatsApp number is configured)
 */
const buildWhatsappHref = (whatsapp, context) => {
  const digits = `${whatsapp || ""}`.replace(/[^\d]/g, "");
  if (!digits) return null;
  const { tripName, tripUrl, batchDates, guests } = context || {};
  const lines = [
    `Hi Nomadic Townies, I'd like to enquire about ${tripName || "a trip"}.`,
    batchDates ? `Dates: ${batchDates}` : null,
    guests ? `Guests: ${guests}` : null,
    tripUrl ? `Trip: ${tripUrl}` : null,
    `(This is an enquiry, not a confirmed booking.)`,
  ].filter(Boolean);
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
};

const PaymentMaintenanceNotice = ({ status, context, fallbackEmail = "hello@nomadictownies.com" }) => {
  const heading = status?.heading || "Online payments are temporarily unavailable";
  const body =
    status?.body ||
    "We're currently updating our secure payment system. You can still explore our experiences and plan your trip. This is an enquiry, not a confirmed booking.";
  const ctaLabel = status?.ctaLabel || "Enquire on WhatsApp";
  const waHref = buildWhatsappHref(status?.whatsapp, context);

  const mailHref = (() => {
    const subject = `Trip enquiry: ${context?.tripName || "Nomadic Townies"}`;
    const lines = [
      `I'd like to enquire about ${context?.tripName || "a trip"}.`,
      context?.batchDates ? `Dates: ${context.batchDates}` : null,
      context?.guests ? `Guests: ${context.guests}` : null,
      context?.tripUrl ? `Trip: ${context.tripUrl}` : null,
    ].filter(Boolean);
    return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  })();

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        border: "1px solid var(--line, #E6DDCF)",
        background: "var(--surface-soft, #FBF6EE)",
        borderRadius: "var(--card-radius, 16px)",
        padding: "20px 22px",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 17, color: "var(--ink-900, #221C17)", marginBottom: 8 }}>
        {heading}
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-700, #5A5247)", margin: "0 0 16px" }}>
        {body}
      </p>

      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--brand-600, #CF4A2C)", color: "#fff",
            fontWeight: 700, fontSize: 15, textDecoration: "none",
            padding: "13px 22px", borderRadius: 999, minHeight: 44, boxSizing: "border-box",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.15.82.84-3.07-.2-.32a8.2 8.2 0 1 1 7.06 3.9z" />
          </svg>
          {ctaLabel}
        </a>
      ) : (
        <a
          href={mailHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--brand-600, #CF4A2C)", color: "#fff",
            fontWeight: 700, fontSize: 15, textDecoration: "none",
            padding: "13px 22px", borderRadius: 999, minHeight: 44, boxSizing: "border-box",
          }}
        >
          Contact us to enquire
        </a>
      )}

      <div style={{ fontSize: 12.5, color: "var(--ink-500, #8A8073)", marginTop: 12 }}>
        Your trip selection is saved — nothing has been charged.
      </div>
    </div>
  );
};

export default PaymentMaintenanceNotice;
