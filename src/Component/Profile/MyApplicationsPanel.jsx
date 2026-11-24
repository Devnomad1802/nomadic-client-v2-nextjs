"use client";

import { useNavigate } from "react-router-dom";
import { useMyApplicationsQuery, useWithdrawApplicationMutation } from "../../services/JoinRequestApi";

/* My Applications — host-approval booking requests for the signed-in traveller.
 * Status-driven next action. No other traveller's data is ever shown. */

const STATUS_META = {
  pending: { label: "Under review", color: "#b7791f", bg: "#fffaf0" },
  call_scheduled: { label: "Call scheduled", color: "#2b6cb0", bg: "#ebf8ff" },
  approved: { label: "Approved", color: "#2f855a", bg: "#f0fff4" },
  declined: { label: "Not accepted", color: "#718096", bg: "#f7fafc" },
  expired: { label: "Expired", color: "#718096", bg: "#f7fafc" },
  revoked: { label: "Unavailable", color: "#9b2c2c", bg: "#fff5f5" },
  withdrawn: { label: "Withdrawn", color: "#718096", bg: "#f7fafc" },
  booked: { label: "Booked", color: "#2c5282", bg: "#ebf8ff" },
};

export default function MyApplicationsPanel() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMyApplicationsQuery();
  const [withdraw, { isLoading: withdrawing }] = useWithdrawApplicationMutation();
  const rows = data?.data || [];

  if (isLoading) return <p style={{ color: "#726A5E" }}>Loading…</p>;
  if (isError) return <p style={{ color: "#c53030" }}>Couldn't load your applications.</p>;
  if (rows.length === 0) {
    return (
      <p style={{ color: "#726A5E" }}>
        No join requests yet. Host-approved trips show a <strong>Request to Join</strong> button.
      </p>
    );
  }

  const openTrip = (r) => navigate(`/trips/${r.tripSlug || r.tripId}`);

  const onWithdraw = async (id) => {
    if (!window.confirm("Withdraw this request?")) return;
    try { await withdraw(id).unwrap(); } catch (e) { alert(e?.data?.message || "Could not withdraw."); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((r) => {
        const meta = STATUS_META[r.status] || STATUS_META.pending;
        const canWithdraw = ["pending", "call_scheduled", "approved"].includes(r.status);
        const canBook = r.status === "approved" && r.cta === "book_now";
        return (
          <div key={r.id} style={{ border: "1px solid #E6DDCF", borderRadius: 14, padding: 16, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#221C17", fontSize: 15 }}>{r.tripTitle || "Trip"}</div>
                <div style={{ color: "#9A9080", fontSize: 12, marginTop: 2 }}>
                  Batch #{(r.batchIndex ?? 0) + 1} · {r.partySize} traveller{r.partySize > 1 ? "s" : ""}
                  {r.expiresAt && r.status === "approved" ? ` · expires ${new Date(r.expiresAt).toLocaleString("en-IN")}` : ""}
                </div>
              </div>
              <span style={{ background: meta.bg, color: meta.color, padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                {meta.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              {canBook && (
                <button onClick={() => openTrip(r)} style={{ background: "#CF4A2C", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>
                  Book now →
                </button>
              )}
              {(r.status === "expired" || r.status === "declined" || r.status === "withdrawn") && (
                <button onClick={() => openTrip(r)} style={{ background: "#fff", color: "#CF4A2C", border: "1px solid #CF4A2C", borderRadius: 10, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>
                  View trip
                </button>
              )}
              {canWithdraw && (
                <button onClick={() => onWithdraw(r.id)} disabled={withdrawing} style={{ background: "#fff", color: "#718096", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 18px", cursor: "pointer" }}>
                  Withdraw
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
