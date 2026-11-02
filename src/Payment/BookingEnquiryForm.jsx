"use client";

import React, { useState } from "react";
import { useCreateBookingEnquiryMutation } from "../services/EnquirApi";

/**
 * BookingEnquiryForm — the in-site fallback when checkout is unavailable.
 * Collects name + (email or phone) + message, prefilled with non-sensitive trip
 * context. Success is shown ONLY after the server confirms it persisted. No PII
 * beyond contact, no payment data.
 *
 * Props: context { tripId, tripName, batchInfo, guests }, onCancel?
 */
const field = {
  width: "100%", padding: "11px 13px", borderRadius: 10, fontSize: 14,
  border: "1.5px solid var(--line,#E6DDCF)", background: "#fff",
  color: "var(--ink-800,#3C3228)", outline: "none", boxSizing: "border-box",
  fontFamily: "var(--inter)",
};

const BookingEnquiryForm = ({ context = {}, onCancel }) => {
  const [submit, { isLoading }] = useCreateBookingEnquiryMutation();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({
    Name: "", Email: "", Phone: "", consent: false,
    Message: `I'd like to enquire about ${context.tripName || "a trip"}${context.batchInfo ? ` (${context.batchInfo})` : ""}${context.guests ? `, ${context.guests} guest(s)` : ""}.`,
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.consent) { setErr("Please agree to be contacted about this enquiry."); return; }
    try {
      await submit({
        Name: f.Name, Email: f.Email, Phone: f.Phone, Message: f.Message,
        tripId: context.tripId, tripName: context.tripName,
        batchInfo: context.batchInfo, partySize: context.guests,
      }).unwrap();
      setDone(true); // only after the server persisted it
    } catch (e2) {
      setErr(e2?.data?.error || "Could not submit. Please try again or use WhatsApp.");
    }
  };

  if (done) {
    return (
      <div role="status" aria-live="polite" style={{ padding: "16px 0", color: "var(--ink-800,#3C3228)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Enquiry sent ✓</div>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-700,#5A5247)", margin: 0 }}>
          Our team has your enquiry and will reach out. This is an enquiry — <b>no booking is confirmed and nothing was charged.</b>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 6 }}>
      <input style={field} placeholder="Your name" value={f.Name} onChange={(e) => set("Name", e.target.value)} aria-label="Your name" />
      <input style={field} placeholder="Email" type="email" value={f.Email} onChange={(e) => set("Email", e.target.value)} aria-label="Email" />
      <input style={field} placeholder="Phone (optional if email given)" value={f.Phone} onChange={(e) => set("Phone", e.target.value)} aria-label="Phone" />
      <textarea style={{ ...field, minHeight: 72, resize: "vertical" }} value={f.Message} onChange={(e) => set("Message", e.target.value)} aria-label="Message" />
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "var(--ink-600,#726A5E)" }}>
        <input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} style={{ marginTop: 2 }} />
        I agree to be contacted about this enquiry.
      </label>
      {err && <div role="alert" style={{ color: "#B91C1C", fontSize: 13 }}>{err}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={isLoading} style={{
          background: "var(--brand-600,#CF4A2C)", color: "#fff", border: "none", borderRadius: 999,
          padding: "12px 22px", fontWeight: 700, fontSize: 14, minHeight: 44, cursor: "pointer",
        }}>{isLoading ? "Sending…" : "Send enquiry"}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{
            background: "none", border: "1.5px solid var(--line,#E6DDCF)", borderRadius: 999,
            padding: "12px 20px", fontWeight: 600, fontSize: 14, minHeight: 44, cursor: "pointer",
            color: "var(--ink-700,#5A5247)",
          }}>Back</button>
        )}
      </div>
    </form>
  );
};

export default BookingEnquiryForm;
