"use client";

import { Box, Container, Typography } from "@mui/material";
import { fav } from "../../assets/LandingPage";
import Googlebanner from "../../SmallComponents/Googlebanner";

const ReviewsBanner = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 5, sm: 10, md: 10 },
      }}
    >
      {" "}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: { xs: "column-reverse", md: "row" },
          alignItems: "center",
          gap: "0px 30px",
          mb: { xs: -3, sm: 0 },
        }}
      >
        <Typography
          sx={{ color: "#6D7280", fontSize: { xs: "16px", sm: "24px" } }}
        >
          Discover why Travellers love us
        </Typography>
        <Box
          sx={{
            width: {
              xs: "50px",
              md: "66px",
              borderRadius: "3px",
            },
          }}
        >
          <img
            src={fav}
            alt=""
            srcSet=""
            style={{
              width: "100%",
              borderRadius: "32px",
              marginTop: 5,
            }}
          />
        </Box>
      </Box>
      <Googlebanner />
    </Container>
  );
};

export default ReviewsBanner;
