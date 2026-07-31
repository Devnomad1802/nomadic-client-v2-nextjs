"use client";

import { useRef, useState } from "react";
import {
  useGetMyPendingReviewsQuery,
  useGetMyReviewsQuery,
  useSubmitTripReviewMutation,
} from "../../services/ReviewsApis";

const fmt = (d) => {
  if (!d) return "";
  const t = new Date(d);
  return isNaN(t) ? "" : t.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const Stars = ({ value, onChange, size = 26 }) => (
  <div className="nt-stars" role={onChange ? "radiogroup" : undefined}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`nt-star ${n <= value ? "on" : ""}`}
        style={{ fontSize: size, cursor: onChange ? "pointer" : "default" }}
        onClick={onChange ? () => onChange(n) : undefined}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        disabled={!onChange}
      >★</button>
    ))}
  </div>
);

const ReviewsPanel = ({ notify }) => {
  const pendingQ = useGetMyPendingReviewsQuery();
  const mineQ = useGetMyReviewsQuery();
  const [submitTripReview, { isLoading: submitting }] = useSubmitTripReviewMutation();

  const [modal, setModal] = useState(null); // pending item being reviewed
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [recommend, setRecommend] = useState(null);
  const [photos, setPhotos] = useState([]);
  const fileRef = useRef(null);

  const openModal = (item) => {
    setModal(item);
    setRating(0);
    setText("");
    setRecommend(null);
    setPhotos([]);
  };

  const pickPhotos = (e) => {
    const files = Array.from(e.target.files || [])
      .filter((f) => ["image/jpeg", "image/jpg", "image/png"].includes(f.type) && f.size <= 5 * 1024 * 1024)
      .slice(0, 5 - photos.length);
    if (files.length !== (e.target.files?.length || 0)) notify?.("JPG or PNG, up to ~5MB.");
    setPhotos((p) => [...p, ...files].slice(0, 5));
    e.target.value = "";
  };

  const submit = async () => {
    if (!modal) return;
    if (!rating) return notify?.("Please pick a star rating.");
    try {
      const fd = new FormData();
      fd.append("bookingId", modal.bookingId);
      fd.append("rating", String(rating));
      fd.append("review", text.trim());
      if (recommend !== null) fd.append("wouldRecommend", String(recommend));
      photos.forEach((f) => fd.append("photos", f));
      await submitTripReview(fd).unwrap();
      notify?.("Review submitted — thank you! ✓");
      setModal(null);
      pendingQ.refetch();
      mineQ.refetch();
    } catch (err) {
      console.error("submit review failed:", err);
      notify?.(err?.data?.error || "Could not submit review. Please try again.");
    }
  };

  const pending = pendingQ.data?.data || [];
  const mine = mineQ.data?.data || [];

  return (
    <div className="nt-reviews">
      {/* ── Pending ── */}
      <h3 className="nt-rv-h">Pending reviews</h3>
      {pendingQ.isLoading ? (
        <div className="nt-state">Checking your completed trips…</div>
      ) : pendingQ.isError ? (
        <div className="nt-state nt-state-err">Couldn&apos;t load pending reviews. <button className="nt-link" onClick={() => pendingQ.refetch()}>Retry</button></div>
      ) : !pending.length ? (
        <div className="nt-rv-empty">Nothing to review right now — completed trips will appear here.</div>
      ) : (
        <div className="nt-rv-pending">
          {pending.map((p) => (
            <div className="nt-rv-card" key={p.bookingId}>
              {p.bannerImage ? <img className="nt-rv-img" src={p.bannerImage} alt={p.tripName} loading="lazy" /> : <div className="nt-rv-img nt-rv-ph" />}
              <div className="nt-rv-body">
                <div className="nt-rv-title">{p.tripName}</div>
                <div className="nt-rv-meta">{p.location}{p.endedOn ? ` · ended ${fmt(p.endedOn)}` : ""}</div>
              </div>
              <button className="nt-cta nt-cta-sm" onClick={() => openModal(p)}>Write review</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Submitted ── */}
      <h3 className="nt-rv-h" style={{ marginTop: 30 }}>Submitted reviews</h3>
      {mineQ.isLoading ? (
        <div className="nt-state">Loading your reviews…</div>
      ) : mineQ.isError ? (
        <div className="nt-state nt-state-err">Couldn&apos;t load reviews. <button className="nt-link" onClick={() => mineQ.refetch()}>Retry</button></div>
      ) : !mine.length ? (
        <div className="nt-rv-empty">You haven&apos;t submitted any reviews yet.</div>
      ) : (
        <div className="nt-rv-list">
          {mine.map((r) => (
            <div className="nt-rv-item" key={r._id}>
              <div className="nt-rv-item-head">
                <span className="nt-rv-title">{r.tripName || "Trip"}</span>
                <Stars value={r.rating} size={16} />
              </div>
              {r.review && <p className="nt-rv-text">{r.review}</p>}
              <div className="nt-rv-meta">
                {fmt(r.createdAt || r.date)}
                {r.wouldRecommend === true && " · Recommends this trip"}
                {r.status === "pending" && " · Awaiting approval"}
              </div>
              {Array.isArray(r.photos) && r.photos.length > 0 && (
                <div className="nt-rv-photos">
                  {r.photos.map((u, i) => <img key={i} src={u} alt="" loading="lazy" />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Write-review modal ── */}
      {modal && (
        <div className="nt-rv-overlay" onClick={() => !submitting && setModal(null)}>
          <div className="nt-rv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nt-rv-modal-head">
              <div>
                <div className="nt-rv-title">{modal.tripName}</div>
                <div className="nt-rv-meta">{modal.location}</div>
              </div>
              <button className="nt-rv-x" onClick={() => setModal(null)} aria-label="Close">✕</button>
            </div>

            <div className="nt-lbl" style={{ marginTop: 18 }}>Your rating</div>
            <Stars value={rating} onChange={setRating} />

            <div className="nt-lbl" style={{ marginTop: 16 }}>Your review</div>
            <textarea
              className="nt-in nt-rv-ta"
              rows={4}
              maxLength={2000}
              placeholder="How was the trip? The host, the group, the experience…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="nt-lbl" style={{ marginTop: 16 }}>Would you recommend this trip?</div>
            <div className="nt-rv-rec">
              <button className={`nt-chiplet ${recommend === true ? "on" : ""}`} onClick={() => setRecommend(true)}>👍 Yes</button>
              <button className={`nt-chiplet ${recommend === false ? "on" : ""}`} onClick={() => setRecommend(false)}>👎 No</button>
            </div>

            <div className="nt-lbl" style={{ marginTop: 16 }}>Photos (optional, up to 5)</div>
            <div className="nt-rv-photo-row">
              {photos.map((f, i) => (
                <div className="nt-rv-thumb" key={i}>
                  <img src={URL.createObjectURL(f)} alt="" />
                  <button className="nt-rv-thumb-x" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              {photos.length < 5 && (
                <button className="nt-rv-add" onClick={() => fileRef.current?.click()}>+</button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" multiple hidden onChange={pickPhotos} />
            </div>

            <div className="nt-rv-actions">
              <button className="nt-ghost" disabled={submitting} onClick={() => setModal(null)}>Cancel</button>
              <button className="nt-cta nt-cta-sm" disabled={submitting} onClick={submit}>
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPanel;
