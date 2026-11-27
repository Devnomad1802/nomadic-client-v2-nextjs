"use client";

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { openChat } from "../utils/chatDrawerStore";

// Chat is a pop-up, not a page. A direct /messages link (e.g. from an email
// CTA) sends the traveller to the home page and opens the chat pop-up in place,
// landing on ?c=<conversation> when provided.
const MessagesInbox = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const c = searchParams?.get?.("c") || null;
    navigate("/", { replace: true });
    openChat(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default MessagesInbox;
