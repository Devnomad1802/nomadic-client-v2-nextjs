import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserDbData } from "../slices";
import { useUpdateBookmarkMutation } from "../services";

// Single source of truth for the heart/favourite across every card on the site.
// Saved trip ids live on userDbData.bookmarks (persisted via redux-persist and
// refreshed from the server on login), so the heart state stays consistent on
// Home, Experiences, Trip Detail, Saved Trips, and survives refresh + re-login.
export const useBookmark = (onNeedAuth) => {
  const dispatch = useDispatch();
  const { userDbData } = useSelector((store) => store.global) || {};
  const [updateBookmark] = useUpdateBookmarkMutation();

  const savedIds = useMemo(
    () => new Set((userDbData?.bookmarks || []).map((id) => `${id}`)),
    [userDbData]
  );

  const isSaved = useCallback((tripId) => savedIds.has(`${tripId}`), [savedIds]);

  const toggle = useCallback(
    async (tripId, e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (!tripId) return;
      if (!userDbData?._id) {
        if (onNeedAuth) onNeedAuth();
        else alert("Please log in to save trips.");
        return;
      }

      const id = `${tripId}`;
      const current = (userDbData.bookmarks || []).map((x) => `${x}`);
      const willSave = !current.includes(id);
      const next = willSave ? [...current, id] : current.filter((x) => x !== id);

      // optimistic — update the persisted user so every heart re-renders at once
      dispatch(setUserDbData({ ...userDbData, bookmarks: next }));
      try {
        await updateBookmark({ userId: userDbData._id, tripId: id, bookmark: willSave }).unwrap();
      } catch (err) {
        console.error("bookmark toggle failed:", err);
        dispatch(setUserDbData({ ...userDbData, bookmarks: current })); // revert
      }
    },
    [userDbData, dispatch, updateBookmark, onNeedAuth]
  );

  return { isSaved, toggle, isLoggedIn: !!userDbData?._id };
};
