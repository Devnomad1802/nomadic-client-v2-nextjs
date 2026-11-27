"use client";

// Tiny reactive store for the global chat pop-up (slide-over drawer). Any
// component can open the chat in place — the nav icon, the preview dropdown and
// the new-message toast all call openChat() — without navigating to a page.
import { useSyncExternalStore } from "react";

let state = { open: false, convoId: null };
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

// Open the chat pop-up. Pass a conversation id to land straight on that thread.
export const openChat = (convoId = null) => {
  state = { open: true, convoId: convoId || null };
  emit();
};

export const closeChat = () => {
  state = { open: false, convoId: state.convoId };
  emit();
};

const subscribe = (cb) => { subs.add(cb); return () => subs.delete(cb); };
const getSnapshot = () => state;

export const useChatDrawer = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
