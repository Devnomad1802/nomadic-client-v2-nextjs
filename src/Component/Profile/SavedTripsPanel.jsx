"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetBookmarkedTripsMutation, useUpdateBookmarkMutation } from "../../services";
import { setUserDbData } from "../../slices";
import { extractRating } from "../../utils";

const PER_PAGE = 6;
const inr = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const SavedTripsPanel = () => {
  const { userDbData } = useSelector((store) => store.global) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [getBookmarkedTrips] = useGetBookmarkedTripsMutation();
  const [updateBookmark] = useUpdateBookmarkMutation();

  const [state, setState] = useState({ loading: true, error: false, list: [] });
  const [removing, setRemoving] = useState({});
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!userDbData?._id) { setState({ loading: false, error: false, list: [] }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));
    try {
      const res = await getBookmarkedTrips({ userId: userDbData._id }).unwrap();
      setState({ loading: false, error: false, list: Array.isArray(res) ? res : [] });
    } catch (e) {
      console.error("Saved Trips load failed:", e);
      setState({ loading: false, error: true, list: [] });
    }
  }, [getBookmarkedTrips, userDbData]);

  useEffect(() => { load(); }, [load]);

  const remove = async (tripId) => {
    if (!userDbData?._id) return;
    setRemoving((r) => ({ ...r, [tripId]: true }));
    // optimistic — drop from the list AND from the global saved-ids so every
    // heart across the site flips off immediately and stays in sync.
    setState((s) => ({ ...s, list: s.list.filter((t) => t._id !== tripId) }));
    dispatch(setUserDbData({
      ...userDbData,
      bookmarks: (userDbData.bookmarks || []).filter((x) => `${x}` !== `${tripId}`),
    }));
    try {
      await updateBookmark({ userId: userDbData._id, tripId, bookmark: false }).unwrap();
    } catch (e) {
      console.error("remove bookmark failed:", e);
      load(); // restore from server on failure
    } finally {
      setRemoving((r) => ({ ...r, [tripId]: false }));
    }
  };

  if (state.loading) return <div className="nt-state">Loading saved trips…</div>;
  if (state.error) return <div className="nt-state nt-state-err">Couldn&apos;t load saved trips. <button className="nt-link" onClick={load}>Retry</button></div>;
  if (!state.list.length) return (
    <div className="nt-empty-box">
      <div className="nt-empty-ic">♥</div>
      <div className="nt-empty-t">No saved trips</div>
      <p>Tap the heart on any experience to save it for later.</p>
      <button className="nt-cta nt-cta-sm" onClick={() => navigate("/experiences")}>Browse experiences</button>
    </div>
  );

  const pageCount = Math.max(1, Math.ceil(state.list.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pageItems = state.list.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <>
    <div className="nt-saved">
      {pageItems.map((t) => (
        <div className="nt-card" key={t._id}>
          <div className="nt-card-img" onClick={() => navigate(`/trips/${t.seoSlug || t._id}`)}>
            {t.cardImage ? <img src={t.cardImage} alt={t.title} loading="lazy" /> : <div className="nt-card-ph" />}
            <button
              className="nt-heart"
              title="Remove from saved"
              disabled={removing[t._id]}
              onClick={(e) => { e.stopPropagation(); remove(t._id); }}
            >♥</button>
            {extractRating(t?.ratings) ? (
              <span className="nt-rate">★ {extractRating(t.ratings)}</span>
            ) : null}
          </div>
          <div className="nt-card-body">
            <div className="nt-card-ttl" onClick={() => navigate(`/trips/${t.seoSlug || t._id}`)}>{t.title}</div>
            <div className="nt-card-loc">⌖ {t.location || "—"}</div>
            <div className="nt-card-row">
              <span className="nt-card-price">₹ {inr(t.price)} <span className="nt-per">/ person</span></span>
              {(t.nights || t.days) && <span className="nt-card-dur">◷ {t.nights}N / {t.days}D</span>}
            </div>
            <button className="nt-card-cta" onClick={() => navigate(`/trips/${t.seoSlug || t._id}`)}>View trip</button>
          </div>
        </div>
      ))}
    </div>
    {pageCount > 1 && (
      <div className="nt-pager">
        <button className="nt-pg-btn" disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Prev</button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <button key={n} className={`nt-pg-num ${n === safePage ? "on" : ""}`} onClick={() => setPage(n)}>{n}</button>
        ))}
        <button className="nt-pg-btn" disabled={safePage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Next ›</button>
      </div>
    )}
    </>
  );
};

export default SavedTripsPanel;
