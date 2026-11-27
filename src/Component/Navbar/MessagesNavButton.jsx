"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  IconButton,
  Menu,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import {
  useGetUnreadCountQuery,
  useGetMyHostChatsMutation,
} from "../../services";

const ORANGE = "#E9622F";

// A short relative time ("2h", "3d") for the preview rows.
const ago = (d) => {
  const t = new Date(d).getTime();
  if (!t || isNaN(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const lastText = (chat) => {
  const m = Array.isArray(chat) && chat.length ? chat[chat.length - 1] : null;
  return m?.Message ? String(m.Message).slice(0, 48) : "No messages yet";
};

// Messages entry for the top nav: an icon with a server-derived unread badge and
// a lightweight dropdown preview of recent threads. Authenticated travellers
// only — the caller already gates on login, but we also skip the query when
// logged out so no request fires.
const MessagesNavButton = ({ compact = false }) => {
  const navigate = useNavigate();
  const { userDbData } = useSelector((store) => store.global);
  const [anchor, setAnchor] = useState(null);

  // Badge: poll gently while the tab is visible; refetch on focus/reconnect.
  const { data: unread } = useGetUnreadCountQuery(undefined, {
    skip: !userDbData,
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [fetchChats, { data: chatsRes, isLoading }] = useGetMyHostChatsMutation();
  const convos = Array.isArray(chatsRes?.data) ? chatsRes.data : [];

  if (!userDbData) return null;

  const display = unread?.display && unread.display !== "0" ? unread.display : null;

  const openMenu = (e) => {
    setAnchor(e.currentTarget);
    fetchChats(); // refresh preview on open
  };
  const close = () => setAnchor(null);
  const goTo = (id) => { close(); navigate(id ? `/messages?c=${id}` : "/messages"); };

  return (
    <Box>
      <IconButton aria-label={display ? `Messages, ${display} unread` : "Messages"} onClick={openMenu} sx={{ p: 0.75 }}>
        <Badge
          color="error"
          overlap="circular"
          badgeContent={display || 0}
          invisible={!display}
          sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}
        >
          <ForumOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: compact ? "left" : "right" }}
        transformOrigin={{ vertical: "top", horizontal: compact ? "left" : "right" }}
        slotProps={{ paper: { sx: { width: 320, maxWidth: "92vw", borderRadius: 2, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.25, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#221C17" }}>Messages</Typography>
          <Typography onClick={() => goTo()} sx={{ fontSize: 12, color: ORANGE, cursor: "pointer", fontWeight: 600 }}>
            See all
          </Typography>
        </Box>
        <Divider />

        {isLoading && (
          <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}><CircularProgress size={20} /></Box>
        )}
        {!isLoading && convos.length === 0 && (
          <Box sx={{ py: 3, px: 2, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#726A5E" }}>No conversations yet.</Typography>
          </Box>
        )}
        {!isLoading && convos.slice(0, 6).map((c) => (
          <Box
            key={c._id}
            onClick={() => goTo(c._id)}
            sx={{ px: 2, py: 1.25, display: "flex", gap: 1.25, alignItems: "center", cursor: "pointer", "&:hover": { background: "#F9F6EF" } }}
          >
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", background: "#E7E0D3", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {c.host?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.host.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#8A7E6C" }}>{(c.host?.name || "H").slice(0, 1)}</Typography>
              )}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: "#221C17" }}>{c.host?.name || "Host"}</Typography>
                <Typography sx={{ fontSize: 11, color: "#9C9388", flexShrink: 0 }}>{ago(c.Date)}</Typography>
              </Box>
              <Typography noWrap sx={{ fontSize: 12, color: c.userUnread ? "#221C17" : "#726A5E", fontWeight: c.userUnread ? 600 : 400 }}>
                {lastText(c.chat)}
              </Typography>
            </Box>
            {c.userUnread ? <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} /> : null}
          </Box>
        ))}
      </Menu>
    </Box>
  );
};

export default MessagesNavButton;
