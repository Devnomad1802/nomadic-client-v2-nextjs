"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  ButtonBase,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetMyHostChatsMutation,
  useSendHostChatMessageMutation,
  useMarkHostChatReadMutation,
} from "../../services";
import { setActiveChatConvo } from "../../utils/chatUiState";
import { setUnread } from "../../utils/chatDrawerStore";

const INK = "#221C17";
const MUTED = "#726A5E";
const ORANGE = "#E9622F";       // brand accent — graphical marks (unread dot, send fill)
const BUBBLE = "#C14A1E";       // own-message bubble: brand orange-red, AA-safe w/ white (4.7:1)
const LINE = "#E6DDCF";

const fmtTime = (d) => {
  const t = new Date(d);
  if (isNaN(t)) return "";
  return t.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

// Shared chat body used by both the slide-over pop-up and the /messages page.
//  - compact: force single-pane (list OR thread) — used inside the narrow drawer.
//  - initialConvoId: land straight on a thread (toast / deep link).
//  - onClose: when provided, render a close (X) control.
const ChatPanel = ({ compact = false, initialConvoId = null, onClose }) => {
  const { userDbData } = useSelector((store) => store.global);

  const [fetchChats, { data, isLoading, isError }] = useGetMyHostChatsMutation();
  const [sendMessage, { isLoading: sending }] = useSendHostChatMessageMutation();
  const [markRead] = useMarkHostChatReadMutation();

  const [picked, setPicked] = useState(initialConvoId);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const scrollRef = useRef(null);
  const isNarrow = useMediaQuery("(max-width:900px)");
  const singlePane = compact || isNarrow;

  const convos = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  // Derived selection: explicit pick → initial → (two-pane only) newest thread.
  const selectedId = picked !== null ? picked : (initialConvoId || (!singlePane && convos.length ? convos[0]._id : null));
  const selected = useMemo(() => convos.find((c) => String(c._id) === String(selectedId)) || null, [convos, selectedId]);

  // Load + gentle poll while visible.
  useEffect(() => {
    if (!userDbData) return undefined;
    fetchChats();
    const id = setInterval(() => { if (document.visibilityState === "visible") fetchChats(); }, 20000);
    const onFocus = () => fetchChats();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, [userDbData, fetchChats]);

  // Tell the toaster which thread is on screen (so it stays quiet for it).
  useEffect(() => {
    setActiveChatConvo(selectedId ? String(selectedId) : null);
    return () => setActiveChatConvo(null);
  }, [selectedId]);

  // Keep the nav badge in sync immediately after read/send (not just the 20s poll).
  useEffect(() => {
    setUnread(convos.reduce((s, c) => s + (Number(c.userUnread) || 0), 0));
  }, [convos]);

  // Mark read when a thread is actually opened (RTK triggers only).
  useEffect(() => {
    if (selected && selected.userUnread > 0) {
      markRead({ id: selected._id }).unwrap().then(() => fetchChats()).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Keep newest message in view.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selected?.chat?.length, selectedId]);

  const onSend = async () => {
    const text = draft.trim();
    if (!text || !selected) return;
    setSendError("");
    try {
      await sendMessage({ id: selected._id, message: text }).unwrap();
      setDraft("");
      fetchChats();
    } catch (e) {
      setSendError(e?.data?.error || e?.data?.message || "Could not send. Try again.");
    }
  };

  const showList = !singlePane || !selected;
  const showThread = !singlePane || !!selected;

  return (
    <Box sx={{ display: "flex", height: "100%", minHeight: 0, background: "#fff" }}>
      {/* ── list ── */}
      {showList && (
        <Box sx={{ width: { xs: "100%", md: compact ? "100%" : 340 }, borderRight: { md: compact ? "none" : `1px solid ${LINE}` }, display: "flex", flexDirection: "column", flexShrink: 0, minHeight: 0 }}>
          <Box sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: INK }}>Messages</Typography>
            {onClose && <IconButton aria-label="Close messages" onClick={onClose} sx={{ minWidth: 40, minHeight: 40 }}><CloseIcon /></IconButton>}
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {isLoading && <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}><CircularProgress size={22} /></Box>}
            {isError && !isLoading && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography sx={{ fontSize: 13, color: MUTED }}>Couldn’t load your messages.</Typography>
                <ButtonBase onClick={() => fetchChats()} sx={{ mt: 1, fontSize: 13, color: BUBBLE, fontWeight: 600, borderRadius: 1, px: 1, py: 0.5 }}>Retry</ButtonBase>
              </Box>
            )}
            {!isLoading && !isError && convos.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ fontSize: 14, color: INK, fontWeight: 600 }}>No messages yet</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 13, color: MUTED }}>Message a host from any experience page to start a conversation.</Typography>
              </Box>
            )}
            {convos.map((c) => {
              const last = c.chat?.length ? c.chat[c.chat.length - 1] : null;
              const active = String(c._id) === String(selectedId);
              return (
                <ButtonBase
                  key={c._id}
                  onClick={() => setPicked(c._id)}
                  aria-label={`Open conversation with ${c.host?.name || "host"}${c.userUnread ? ", unread" : ""}`}
                  aria-current={active ? "true" : undefined}
                  sx={{ width: "100%", justifyContent: "flex-start", textAlign: "left", px: 2, py: 1.5, display: "flex", gap: 1.25, background: active ? "#F9F6EF" : "transparent", borderBottom: "1px solid #F1EADF", transition: "background .15s ease", "&:hover": { background: "#F9F6EF" } }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: "50%", background: "#E7E0D3", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {c.host?.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={c.host.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <Typography sx={{ fontWeight: 700, color: "#6E6355" }}>{(c.host?.name || "H").slice(0, 1)}</Typography>}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: INK }}>{c.host?.name || "Host"}</Typography>
                      <Typography sx={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>{last ? fmtTime(last.timeStamp).split(",")[0] : ""}</Typography>
                    </Box>
                    <Typography noWrap sx={{ fontSize: 13, color: c.userUnread ? INK : MUTED, fontWeight: c.userUnread ? 600 : 400 }}>
                      {last?.Message || "No messages yet"}
                    </Typography>
                  </Box>
                  {c.userUnread ? <Box sx={{ alignSelf: "center", width: 9, height: 9, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} /> : null}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── thread ── */}
      {showThread && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
          {!selected ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
              <Typography sx={{ fontSize: 14, color: MUTED }}>Select a conversation to read and reply.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 0.5 }}>
                {singlePane && (
                  <IconButton aria-label="Back to conversations" onClick={() => setPicked("")} sx={{ minWidth: 40, minHeight: 40 }}><ArrowBackIosNewIcon sx={{ fontSize: 18 }} /></IconButton>
                )}
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: INK, flex: 1, minWidth: 0 }} noWrap>{selected.host?.name || "Host"}</Typography>
                {onClose && <IconButton aria-label="Close messages" onClick={onClose} sx={{ minWidth: 40, minHeight: 40 }}><CloseIcon /></IconButton>}
              </Box>

              <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1, minHeight: 0 }}>
                {(selected.chat || []).map((m, i) => {
                  const mine = m.MessageBy === "user";
                  return (
                    <Box key={m._id || i} sx={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                      <Box sx={{ px: 1.5, py: 1, borderRadius: 2, background: mine ? BUBBLE : "#F1EADF", color: mine ? "#fff" : INK, fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {m.Message}
                      </Box>
                      <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.25, textAlign: mine ? "right" : "left" }}>{fmtTime(m.timeStamp)}</Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ borderTop: `1px solid ${LINE}`, p: 1.25 }}>
                {sendError && <Typography sx={{ fontSize: 12, color: "#B23A2A", px: 0.5, pb: 0.5 }}>{sendError}</Typography>}
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                  <TextField
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                    placeholder="Write a message…"
                    aria-label="Message"
                    multiline
                    maxRows={4}
                    fullWidth
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, background: "#fff", fontSize: 14, color: INK } }}
                  />
                  <IconButton aria-label="Send message" onClick={onSend} disabled={sending || !draft.trim()} sx={{ minWidth: 44, minHeight: 44, background: ORANGE, color: "#fff", "&:hover": { background: "#cf551f" }, "&.Mui-disabled": { background: "#E7E0D3", color: "#C7BBA8" } }}>
                    {sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>
                <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.5, px: 0.5 }}>
                  For your safety, contact details shared in chat are moderated.
                </Typography>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ChatPanel;
