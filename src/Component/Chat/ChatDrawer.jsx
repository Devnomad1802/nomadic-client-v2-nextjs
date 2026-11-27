"use client";

import { Drawer } from "@mui/material";
import ChatPanel from "./ChatPanel";
import { useChatDrawer, closeChat } from "../../utils/chatDrawerStore";

// Global chat pop-up: a right-anchored slide-over that overlays the current
// page (no route change). Mounted once near the app root. Closes on the X, the
// backdrop click or Esc — so it never feels "stuck".
const ChatDrawer = () => {
  const { open, convoId } = useChatDrawer();
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeChat}
      transitionDuration={260}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 440 }, maxWidth: "100vw", height: "100%", borderTopLeftRadius: { sm: 14 }, borderBottomLeftRadius: { sm: 14 }, overflow: "hidden" } } }}
    >
      {open && <ChatPanel compact initialConvoId={convoId} onClose={closeChat} />}
    </Drawer>
  );
};

export default ChatDrawer;
