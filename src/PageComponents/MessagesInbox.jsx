"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";
import { Helmet } from "react-helmet-async";
import Footer from "../Component/Footer";
import {
  useGetMyHostChatsMutation,
  useSendHostChatMessageMutation,
  useMarkHostChatReadMutation,
} from "../services";

const INK = "#221C17";
const MUTED = "#726A5E";
const ORANGE = "#E9622F";
const LINE = "#E6DDCF";

const fmtTime = (d) => {
  const t = new Date(d);
  if (isNaN(t)) return "";
  return t.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const MessagesInbox = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userDbData } = useSelector((store) => store.global);

  const [fetchChats, { data, isLoading, isError }] = useGetMyHostChatsMutation();
  const [sendMessage, { isLoading: sending }] = useSendHostChatMessageMutation();
  const [markRead] = useMarkHostChatReadMutation();

  // `picked`: null = no explicit choice yet (fall back to deep-link / first);
  // "" = explicitly none (mobile "back"); else a conversation id.
  const [picked, setPicked] = useState(null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const scrollRef = useRef(null);
  const isMobile = useMediaQuery("(max-width:900px)");

  const convos = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const paramC = searchParams?.get?.("c") || null;
  // Derived selection — no setState-in-effect. Deep link wins first paint; on
  // desktop we open the newest thread by default.
  const selectedId = picked !== null ? picked : (paramC || (!isMobile && convos.length ? convos[0]._id : null));
  const selected = useMemo(() => convos.find((c) => String(c._id) === String(selectedId)) || null, [convos, selectedId]);

  // Auth gate: not logged in → leave the page (no state writes here).
  useEffect(() => {
    if (!userDbData) navigate("/");
  }, [userDbData, navigate]);

  // Load conversations + gentle poll while visible.
  useEffect(() => {
    if (!userDbData) return undefined;
    fetchChats();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchChats();
    }, 30000);
    const onFocus = () => fetchChats();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, [userDbData, fetchChats]);

  // Mark read when an authorized conversation is actually opened (not on login).
  // RTK triggers only — no direct setState.
  useEffect(() => {
    if (selected && selected.userUnread > 0) {
      markRead({ id: selected._id }).unwrap().then(() => fetchChats()).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selected?.chat?.length, selectedId]);

  const onSend = async () => {
    const text = draft.trim();
    if (!text || !selected) return;
    setSendError("");
    try {
      await sendMessage({ id: selected._id, message: text }).unwrap();
      setDraft(""); // clear only on success
      fetchChats();
    } catch (e) {
      // Preserve the draft on a recoverable failure.
      setSendError(e?.data?.error || e?.data?.message || "Could not send. Try again.");
    }
  };

  if (!userDbData) return null;

  const showList = !isMobile || !selected;
  const showThread = !isMobile || !!selected;

  return (
    <Box sx={{ background: "#F4EEE4", minHeight: "70vh" }}>
      <Helmet>
        <title>Messages | Nomadic Townies</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Box sx={{ maxWidth: 1040, mx: "auto", px: { xs: 0, sm: 2 }, py: { xs: 0, sm: 3 } }}>
        <Box sx={{ display: "flex", height: { xs: "calc(100vh - 120px)", sm: "72vh" }, background: "#fff", borderRadius: { xs: 0, sm: 2 }, overflow: "hidden", border: `1px solid ${LINE}` }}>

          {/* ── Conversation list ── */}
          {showList && (
            <Box sx={{ width: { xs: "100%", md: 340 }, borderRight: { md: `1px solid ${LINE}` }, display: "flex", flexDirection: "column", flexShrink: 0 }}>
              <Box sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${LINE}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: INK }}>Messages</Typography>
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                {isLoading && <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}><CircularProgress size={22} /></Box>}
                {isError && !isLoading && (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 13, color: MUTED }}>Couldn’t load your messages.</Typography>
                    <Typography onClick={() => fetchChats()} sx={{ mt: 1, fontSize: 13, color: ORANGE, cursor: "pointer", fontWeight: 600 }}>Retry</Typography>
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
                    <Box
                      key={c._id}
                      onClick={() => setPicked(c._id)}
                      sx={{ px: 2, py: 1.5, display: "flex", gap: 1.25, cursor: "pointer", background: active ? "#F9F6EF" : "transparent", borderBottom: `1px solid #F1EADF`, "&:hover": { background: "#F9F6EF" } }}
                    >
                      <Box sx={{ width: 40, height: 40, borderRadius: "50%", background: "#E7E0D3", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {c.host?.logo
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={c.host.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <Typography sx={{ fontWeight: 700, color: "#8A7E6C" }}>{(c.host?.name || "H").slice(0, 1)}</Typography>}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                          <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: INK }}>{c.host?.name || "Host"}</Typography>
                          <Typography sx={{ fontSize: 11, color: "#9C9388", flexShrink: 0 }}>{last ? fmtTime(last.timeStamp).split(",")[0] : ""}</Typography>
                        </Box>
                        <Typography noWrap sx={{ fontSize: 13, color: c.userUnread ? INK : MUTED, fontWeight: c.userUnread ? 600 : 400 }}>
                          {last?.Message || "No messages yet"}
                        </Typography>
                      </Box>
                      {c.userUnread ? <Box sx={{ alignSelf: "center", width: 9, height: 9, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} /> : null}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ── Conversation thread ── */}
          {showThread && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {!selected ? (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
                  <Typography sx={{ fontSize: 14, color: MUTED }}>Select a conversation to read and reply.</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 1 }}>
                    {isMobile && (
                      <IconButton size="small" aria-label="Back to conversations" onClick={() => setPicked("")}><ArrowBackIosNewIcon sx={{ fontSize: 16 }} /></IconButton>
                    )}
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: INK }}>{selected.host?.name || "Host"}</Typography>
                  </Box>

                  <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {(selected.chat || []).map((m, i) => {
                      const mine = m.MessageBy === "user";
                      return (
                        <Box key={m._id || i} sx={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%" }}>
                          <Box sx={{ px: 1.5, py: 1, borderRadius: 2, background: mine ? ORANGE : "#F1EADF", color: mine ? "#fff" : INK, fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {m.Message}
                          </Box>
                          <Typography sx={{ fontSize: 10.5, color: "#9C9388", mt: 0.25, textAlign: mine ? "right" : "left" }}>{fmtTime(m.timeStamp)}</Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ borderTop: `1px solid ${LINE}`, p: 1.25 }}>
                    {sendError && <Typography sx={{ fontSize: 12, color: "#C0392B", px: 0.5, pb: 0.5 }}>{sendError}</Typography>}
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                      <TextField
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                        placeholder="Write a message…"
                        multiline
                        maxRows={4}
                        fullWidth
                        size="small"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, background: "#fff", fontSize: 14, color: INK } }}
                      />
                      <IconButton aria-label="Send message" onClick={onSend} disabled={sending || !draft.trim()} sx={{ background: ORANGE, color: "#fff", "&:hover": { background: "#cf551f" }, "&.Mui-disabled": { background: "#E7E0D3", color: "#fff" } }}>
                        {sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Box>
                    <Typography sx={{ fontSize: 10.5, color: "#9C9388", mt: 0.5, px: 0.5 }}>
                      For your safety, contact details shared in chat are moderated.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MessagesInbox;
