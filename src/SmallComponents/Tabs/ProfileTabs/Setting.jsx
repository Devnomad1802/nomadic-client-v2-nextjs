"use client";

import { Box, Button, Typography } from "@mui/material";
import React from "react";

const Setting = () => {
  return (
    <Box>
      <Typography
        sx={{
          display: "flex",
          textAlign: "left",
          color: "#000",
          fontFamily: "Inter",
          fontSize: "28px",
          fontStyle: "normal",
          fontWeight: 500,
          lineHeight: "140%",
        }}
      >
        Settings
      </Typography>
      <Button
        sx={{
          display: "flex",
          textAlign: "left",
          color: "#CF4A2C",
          fontFamily: "Inter",
          fontSize: "15px",

          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "140%",
          mt: 2,
        }}
      >
        Delete Account
      </Button>
    </Box>
  );
};

export default Setting;
