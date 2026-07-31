"use client";

import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../Component/Navbar/Navbar";
import ChatNotifier from "../SmallComponents/ChatNotifier";

const Parent = () => {
  return (
    <Box
      sx={{
        background: "#fff",
      }}
    >
      <Navbar />

      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      <ChatNotifier />
    </Box>
  );
};

export default Parent;
