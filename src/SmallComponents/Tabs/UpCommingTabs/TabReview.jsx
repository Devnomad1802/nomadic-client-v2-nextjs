"use client";

import { Box, Typography } from "@mui/material";
import React from "react";
import BasicRating from "../../Rating";
import { t1 } from "../../../Images";

const TabReview = () => {
  return (
    <Box>
      {[1, 2].map((item, index) => {
        return (
          <Box
            key={index}
            sx={{
              border: "1px solid #FAFAFA",
              p: { xs: 1, sm: 2, md: 3 },
              borderRadius: "16px",
              boxShadow: " 0px 0px 5px 2px #F4F4F5",
              my: 2,
              "&:hover": {
                background: "#FAFAFA",
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                gap: "30px 0px",
                mb: 5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0px 10px",
                }}
              >
                <img
                  src={t1}
                  alt=""
                  srcSet=""
                  style={{ width: "48px", borderRadius: "50%" }}
                />
                <Box>
                  <Typography sx={{ color: "#71717A", fontWeight: "500" }}>
                    John Doe
                  </Typography>
                  <Typography sx={{ color: "#D2D5DA" }}>Designer</Typography>
                </Box>
              </Box>

              <BasicRating />
            </Box>
            <Typography sx={{ color: "#3F3F46", textAlign: "left" }}>
              I had a Kasol Tosh Solo with Justwravel. everything was well
              arranged. our tour guide Abhishek Bisht and Sajal Gupta are
              perfect tour guides.
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default TabReview;
