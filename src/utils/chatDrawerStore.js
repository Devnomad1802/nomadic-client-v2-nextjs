"use client";

// Tiny reactive store for the global chat pop-up (slide-over drawer). Any
// component can open the chat in place — the nav icon, the preview dropdown and
// the new-message toast all call openChat() — without navigating to a page.
import { useSyncExternalStore } from "react";

let state = { open: false, convoId: null, unread: 0 };
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

// Open the chat pop-up. Pass a conversation id to land straight on that thread.
export const openChat = (convoId = null) => {
  state = { ...state, open: true, convoId: convoId || null };
  emit();
};

export const closeChat = () => {
  state = { ...state, open: false };
  emit();
};

// Total unread across the traveller's threads, fed by the global ChatNotifier
// poll (of /host-chat/mine). The nav badge reads it — so the count works on the
// live API with no extra endpoint or second poll.
export const setUnread = (n) => {
  const v = Math.max(0, Number(n) || 0);
  if (v === state.unread) return;
  state = { ...state, unread: v };
  emit();
};

const subscribe = (cb) => { subs.add(cb); return () => subs.delete(cb); };
const getSnapshot = () => state;

export const useChatDrawer = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
