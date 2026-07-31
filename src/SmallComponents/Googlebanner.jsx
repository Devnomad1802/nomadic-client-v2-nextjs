"use client";

import { Box, Container, Grid, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { reviesConstant } from "../Constant/HomePageConstant";
import { Link } from "react-router-dom";
import { start } from "../assets/LandingPage";

const Googlebanner = ({ bg }) => {
  const matches = useMediaQuery("(min-width:600px)");
  return (
    <Container>
      <Grid
        container
        // spacing={5}
        sx={{
          background: bg ? bg : "#F3F4F6",
          p: 2,
          borderRadius: { xs: "10px", md: "32px" },
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          mt: 5,
          gap: "30px 0px",
          maxWidth: "1035px",
          mx: "auto",
          boxShadow:
            "0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px 4px 6px 0px rgba(0, 0, 0, 0.05)",
        }}
      >
        {reviesConstant.map((item, index) => {
          return (
            <Grid
              item
              xs={5.5}
              md={3}
              key={index}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "center" },
                alignItems: "start",
                gap: "0px 10px",
              }}
            >
              <Box sx={{ width: { xs: "30px", sm: "40px" } }}>
                <img
                  src={item.img}
                  alt=""
                  srcSet=""
                  style={{ width: "100%" }}
                />
              </Box>
              <Box sx={{}}>
                <Box
                  sx={{
                    background: "#5D5F71",
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.5, sm: 0.7 },
                    borderRadius: "20px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "0px 5px",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  {" "}
                  <Box sx={{ width: { xs: "16px", sm: "18px", md: "24px" } }}>
                    <img
                      src={start}
                      alt=""
                      srcSet=""
                      style={{ width: "100%" }}
                    />{" "}
                  </Box>
                  <Typography
                    sx={{
                      color: "#FBC800",
                      fontWeight: "700",
                      fontSize: { xs: "14px", sm: "14px", md: "16px" },
                    }}
                  >
                    4.4
                  </Typography>
                </Box>
                <Link
                  style={{
                    marginTop: "10px",
                    color: "#6D7280",
                    fontFamily: "Inter",
                    fontSize: matches ? "16px" : "11px",
                  }}
                >
                  303 Reviews
                </Link>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Googlebanner;
