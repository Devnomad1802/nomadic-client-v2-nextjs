"use client";

import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import {
  useApplyToTripMutation,
  useMyApplicationsQuery,
  useWithdrawApplicationMutation,
} from "../services/JoinRequestApi";

const ACCENT = "#CF4A2C";

/**
 * useApprovalCta — single source of truth for the Request-to-Join / Book-Now CTA
 * on an approval-mode trip. Returns { isApproval, label, disabled, variant,
 * onClick, openModal } so every booking surface can render one consistent CTA.
 *
 * For instant trips it is a no-op: isApproval=false, and callers keep their
 * existing Book Now handler unchanged.
 */
export function useApprovalCta({ trip, isLoggedIn, onBookNow, onRequireLogin }) {
  const tripId = trip?._id || trip?.id;
  const isApproval = trip?.bookingMode === "approval";

  // Only the signed-in traveller's own applications; skipped otherwise.
  const { data } = useMyApplicationsQuery(undefined, { skip: !isApproval || !isLoggedIn });
  const [modalOpen, setModalOpen] = useState(false);

  const app = useMemo(() => {
    const rows = data?.data || [];
    return rows.find((r) => String(r.tripId) === String(tripId)) || null;
  }, [data, tripId]);

  if (!isApproval) {
    return { isApproval: false, label: "Book now", disabled: false, onClick: onBookNow, modalOpen, setModalOpen, app: null };
  }

  const openModal = () => {
    if (!isLoggedIn) { onRequireLogin?.(); return; }
    setModalOpen(true);
  };

  let label = "Request to Join";
  let disabled = false;
  let onClick = openModal;

  switch (app?.status) {
    case "pending":
      label = "Application under review"; disabled = true; onClick = undefined; break;
    case "call_scheduled":
      label = "Under review"; disabled = true; onClick = undefined; break;
    case "approved":
      if (app.cta === "book_now") { label = "You're invited — Book now"; onClick = onBookNow; }
      else { label = "Invitation expired — Request renewal"; onClick = openModal; }
      break;
    case "declined":
      label = "Request again"; onClick = openModal; break;
    case "expired":
      label = "Request renewal"; onClick = openModal; break;
    case "revoked":
      label = "Invitation unavailable"; disabled = true; onClick = undefined; break;
    case "withdrawn":
      label = "Request to Join"; onClick = openModal; break;
    case "booked":
      label = "View booking"; onClick = () => { window.location.href = "/profile"; }; break;
    default:
      label = "Request to Join"; onClick = openModal;
  }

  return { isApproval: true, label, disabled, onClick, openModal, modalOpen, setModalOpen, app };
}

/** The Request-to-Join form modal. No payment, minimal personal data. */
export function RequestToJoinModal({ open, onClose, trip, batchIndex = 0, partySize = 1, bookingOption = "" }) {
  const tripId = trip?._id || trip?.id;
  const [apply, { isLoading }] = useApplyToTripMutation();
  const [answers, setAnswers] = useState({ motivation: "", experience: "", availability: "" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    try {
      await apply({ tripId, batchIndex, partySize, bookingOption, answers }).unwrap();
      setDone(true);
    } catch (e) {
      setErr(e?.data?.message || "Could not submit your request. Please try again.");
    }
  };

  const field = (key, label, placeholder) => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5, color: "#1f2733" }}>{label}</Typography>
      <TextField
        fullWidth multiline minRows={2} placeholder={placeholder}
        value={answers[key]}
        onChange={(e) => setAnswers((p) => ({ ...p, [key]: e.target.value.slice(0, 1000) }))}
      />
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {done ? "Request sent" : `Request to Join${trip?.title ? ` — ${trip.title}` : ""}`}
      </DialogTitle>
      <DialogContent>
        {done ? (
          <Box sx={{ py: 1 }}>
            <Typography sx={{ color: "#1f2733", mb: 2 }}>
              Your request is with the host. You'll be notified when they respond — no payment is needed to apply.
              Track it under <strong>My Applications</strong> in your profile.
            </Typography>
            <Button onClick={onClose} variant="contained" sx={{ background: ACCENT, textTransform: "none", "&:hover": { background: "#b53c20" } }}>
              Done
            </Button>
          </Box>
        ) : (
          <Box sx={{ py: 1 }}>
            <Typography sx={{ color: "#726A5E", fontSize: 13, mb: 2 }}>
              This trip is host-approved. Tell the host a little about you — no payment is required to request.
            </Typography>
            {field("motivation", "Why do you want to join?", "A sentence or two about what draws you to this trip.")}
            {field("experience", "Relevant experience", "Any experience relevant to this kind of trip (optional).")}
            {field("availability", "Availability", "Which dates/batch work for you?")}
            {err && <Typography sx={{ color: "#c53030", fontSize: 13, mb: 1 }}>{err}</Typography>}
            <Button
              onClick={submit} disabled={isLoading} variant="contained" fullWidth
              sx={{ background: ACCENT, textTransform: "none", py: 1.2, fontWeight: 700, "&:hover": { background: "#b53c20" } }}
            >
              {isLoading ? "Sending…" : "Send request"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { useWithdrawApplicationMutation };
