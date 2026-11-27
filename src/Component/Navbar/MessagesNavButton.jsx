"use client";

import { useSelector } from "react-redux";
import { Badge, Box, IconButton } from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { useGetUnreadCountQuery } from "../../services";
import { openChat } from "../../utils/chatDrawerStore";

// Messages entry for the top nav: an icon with a server-derived unread badge.
// One tap opens the chat pop-up in place (no page navigation). Authenticated
// travellers only; the query is skipped when logged out so nothing fires.
const MessagesNavButton = () => {
  const { userDbData } = useSelector((store) => store.global);

  const { data: unread } = useGetUnreadCountQuery(undefined, {
    skip: !userDbData,
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  if (!userDbData) return null;

  const display = unread?.display && unread.display !== "0" ? unread.display : null;

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
