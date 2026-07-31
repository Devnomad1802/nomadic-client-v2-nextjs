"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../Component/Footer";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Page Not Found | Nomadic Townies</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore community trips, retreats and cultural immersions with Nomadic Townies." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Container
        maxWidth="sm"
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: { xs: "80px", md: "120px" },
              fontWeight: 800,
              color: "#CD482A",
              lineHeight: 1,
              mb: 1,
              fontFamily: "Inter",
            }}
          >
            404
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "22px", md: "28px" },
              fontWeight: 700,
              color: "#1F2937",
              mb: 1,
              fontFamily: "Inter",
            }}
          >
            Trail not found
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              color: "#6B7280",
              mb: 4,
              fontFamily: "Inter",
              lineHeight: "160%",
              maxWidth: "400px",
              mx: "auto",
            }}
          >
            Looks like this path leads nowhere. Let&apos;s get you back to
            exploring amazing trips across India.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={() => navigate("/")}
              sx={{
                background: "#CD482A",
                color: "#fff",
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "16px",
                fontFamily: "Inter",
                "&:hover": { background: "#B03A1F" },
              }}
            >
              Go Home
            </Button>
            <Button
              onClick={() => navigate("/experiences")}
              variant="outlined"
              sx={{
                borderColor: "#CD482A",
                color: "#CD482A",
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "16px",
                fontFamily: "Inter",
                "&:hover": {
                  background: "#CD482A",
                  color: "#fff",
                },
              }}
            >
              Browse Trips
            </Button>
          </Box>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default NotFound;
