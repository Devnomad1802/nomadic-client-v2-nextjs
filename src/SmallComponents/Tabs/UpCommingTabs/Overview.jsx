"use client";

import { Box, Typography } from "@mui/material";

const Overview = ({ overview }) => {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: "18px", md: "23px" },
          fontWeight: "500",
          color: "#000",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        Overview
      </Typography>
      <Typography
        sx={{
          color: "#5A5247",
          textAlign: { xs: "left", md: "left" },
          mt: 2,
          lineHeight: "170%",
          fontSize: { xs: "14px", md: "16px" },
          fontFamily: "Inter",
        }}
      >
        {overview}
      </Typography>
    </Box>
  );
};

export default Overview;
