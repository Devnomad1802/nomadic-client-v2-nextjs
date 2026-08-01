"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetMyHostChatsMutation } from "../services";
import { getActiveChatConvo } from "../utils/chatUiState";

const POLL_MS = 20000;

// Subtle two-tone chime via WebAudio — no asset, silently skipped when the
// browser blocks audio before a user gesture.
const chime = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const play = (freq, at) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.35);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.4);
    };
    play(880, 0);
    play(1174, 0.12);
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch { /* audio blocked — fine */ }
};

// Polls the logged-in user's host conversations; when a host reply arrives
// (userUnread grows) shows a bottom-right toast + chime — unless that
// conversation's drawer is open on screen.
const ChatNotifier = () => {
  const navigate = useNavigate();
  const { userDbData } = useSelector((store) => store.global) || {};
  const [getMyHostChats] = useGetMyHostChatsMutation();
  const [toasts, setToasts] = useState([]);
  const seen = useRef(null); // convoId -> last userUnread (null = pre-snapshot)

  useEffect(() => {
    if (!userDbData?._id) { seen.current = null; return undefined; }
    let stop = false;

    const tick = async () => {
      if (document.hidden) return; // pause in background tabs
      try {
        const res = await getMyHostChats().unwrap();
        const rows = res?.data || [];
        if (stop) return;
        if (seen.current === null) {
          seen.current = new Map(rows.map((r) => [String(r._id), Number(r.userUnread) || 0]));
          return;
        }
        rows.forEach((r) => {
          const id = String(r._id);
          const unread = Number(r.userUnread) || 0;
          const prev = seen.current.get(id) ?? 0;
          if (unread > prev && getActiveChatConvo() !== id) {
            const lastHostMsg = [...(r.chat || [])].reverse().find((m) => (m.MessageBy || "").toLowerCase() !== "user");
            const t = {
              key: `${id}-${Date.now()}`,
              hostId: String(r.hostId || ""),
              title: `${r.host?.name || "Host"} replied`,
              preview: String(lastHostMsg?.Message || "New message").slice(0, 80),
            };
            setToasts((list) => [...list, t]);
            chime();
            setTimeout(() => setToasts((list) => list.filter((x) => x.key !== t.key)), 6000);
          }
          seen.current.set(id, unread);
        });
      } catch { /* logged out / offline — try next tick */ }
    };

    tick();
    const iv = setInterval(tick, POLL_MS);
    return () => { stop = true; clearInterval(iv); };
  }, [userDbData?._id, getMyHostChats]);

  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1400, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <div
          key={t.key}
          role="button"
          tabIndex={0}
          onClick={() => {
            setToasts((list) => list.filter((x) => x.key !== t.key));
            if (t.hostId) navigate(`/hosts/${t.hostId}?chat=1`);
          }}
          style={{ background: "#18181B", color: "#FFFFFF", borderRadius: 12, padding: "12px 16px", maxWidth: 320, boxShadow: "0 10px 30px -10px rgba(0,0,0,.45)", cursor: "pointer" }}
        >
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.title}</div>
          <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 3, lineHeight: 1.4 }}>{t.preview}</div>
        </div>
      ))}
    </div>
  );
};

export default ChatNotifier;
