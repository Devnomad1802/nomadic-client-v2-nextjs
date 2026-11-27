"use client";

import { useSelector } from "react-redux";
import { Badge, Box, IconButton } from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { openChat, useChatDrawer } from "../../utils/chatDrawerStore";

// Messages entry for the top nav: an icon with an unread badge. One tap opens
// the chat pop-up in place (no page navigation). The unread total is fed by the
// global ChatNotifier poll of /host-chat/mine — so the count works on the live
// API with no extra endpoint. Authenticated travellers only.
const MessagesNavButton = () => {
  const { userDbData } = useSelector((store) => store.global);
  const { unread } = useChatDrawer();

  if (!userDbData) return null;

  const count = Number(unread) || 0;
  const display = count > 99 ? "99+" : count > 0 ? String(count) : null;

  return (
    <Box>
      <IconButton
        aria-label={display ? `Messages, ${display} unread` : "Messages"}
        onClick={() => openChat()}
        sx={{ p: 0.75, minWidth: 44, minHeight: 44 }}
      >
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
    </Box>
  );
};

export default MessagesNavButton;
