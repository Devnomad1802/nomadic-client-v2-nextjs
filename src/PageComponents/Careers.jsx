"use client";

import { Box, Container, Grid, Typography, Button } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import Footer from "../Component/Footer";

const openings = [
  {
    role: "Trip Experience Manager",
    type: "Full-Time",
    location: "Bengaluru, India",
    description:
      "Plan and manage end-to-end trip operations, coordinate with hosts and vendors, and ensure every traveller has an unforgettable experience.",
  },
  {
    role: "Social Media & Content Creator",
    type: "Full-Time",
    location: "Remote",
    description:
      "Tell the Nomadic Townies story through reels, blogs, and captivating social content that inspires travellers to explore the world.",
  },
  {
    role: "Community & Host Relations Executive",
    type: "Full-Time",
    location: "Bengaluru, India",
    description:
      "Build and nurture relationships with our host network and traveller community, ensuring every partnership delivers real value.",
  },
];

const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Careers at Nomadic Townies | Join Our Travel Team</title>
        <meta
          name="description"
          content="Love travel? Join the Nomadic Townies team. We're hiring passionate people to help us craft unforgettable adventures across India and beyond. View open roles."
        />
        <link rel="canonical" href="https://nomadictownies.com/careers" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Careers at Nomadic Townies | Join Our Travel Team"
        />
        <meta
          property="og:description"
          content="Love travel? Join the Nomadic Townies team. We're hiring passionate people to help craft unforgettable adventures across India and beyond."
        />
        <meta property="og:url" content="https://nomadictownies.com/careers" />
        <meta
          property="og:image"
          content="https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Careers at Nomadic Townies | Join Our Travel Team"
        />
        <meta
          name="twitter:description"
          content="Love travel? Join the Nomadic Townies team and help craft unforgettable adventures."
        />
        <meta
          name="twitter:image"
          content="https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg"
        />
      </Helmet>

      <Box>
        {/* Hero */}
        <Box
          sx={{
            background: "#CF4A2C",
            py: { xs: 8, md: 12 },
            px: { xs: 3, md: 6 },
            textAlign: "center",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: "Inter",
              fontSize: { xs: "28px", sm: "36px", md: "48px" },
              fontWeight: 700,
              color: "#fff",
              mb: 2,
            }}
          >
            Travel is our job. Make it yours.
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: { xs: "16px", md: "20px" },
              color: "rgba(255,255,255,0.85)",
              maxWidth: "600px",
              mx: "auto",
              lineHeight: "160%",
            }}
          >
            Join a team of passionate explorers building the future of adventure
            travel in India.
          </Typography>
        </Box>

        {/* Open Roles */}
        <Container sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: { xs: "22px", md: "32px" },
              fontWeight: 700,
              color: "#3C3228",
              mb: 5,
              textAlign: "center",
            }}
          >
            Current Openings
          </Typography>

          <Grid container spacing={3}>
            {openings.map((job, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    border: "1px solid #E6DDCF",
                    borderRadius: "16px",
                    p: { xs: 3, md: 4 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: { xs: "18px", md: "20px" },
                        fontWeight: 700,
                        color: "#3C3228",
                        mb: 0.5,
                      }}
                    >
                      {job.role}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#CF4A2C",
                          fontWeight: 600,
                          background: "#FEF2EC",
                          px: 1.5,
                          py: 0.3,
                          borderRadius: "20px",
                        }}
                      >
                        {job.type}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#726A5E",
                          background: "#F1EADD",
                          px: 1.5,
                          py: 0.3,
                          borderRadius: "20px",
                        }}
                      >
                        {job.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "15px",
                      color: "#5A5247",
                      lineHeight: "160%",
                      flex: 1,
                    }}
                  >
                    {job.description}
                  </Typography>
                  <Button
                    component="a"
                    href="mailto:careers@nomadictownies.com"
                    variant="outlined"
                    sx={{
                      borderColor: "#CF4A2C",
                      color: "#CF4A2C",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        background: "#CF4A2C",
                        color: "#fff",
                      },
                    }}
                  >
                    Apply Now
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* General CTA */}
        <Box
          sx={{
            background: "#221C17",
            py: { xs: 6, md: 8 },
            textAlign: "center",
            px: 3,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: { xs: "20px", md: "28px" },
              fontWeight: 700,
              color: "#fff",
              mb: 2,
            }}
          >
            Don&apos;t see your role?
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "16px",
              color: "rgba(255,255,255,0.7)",
              mb: 3,
              maxWidth: "480px",
              mx: "auto",
            }}
          >
            We&apos;re always looking for great people. Drop us your resume and
            tell us how you&apos;d make Nomadic Townies better.
          </Typography>
          <Button
            component="a"
            href="mailto:careers@nomadictownies.com"
            sx={{
              background: "#CF4A2C",
              color: "#fff",
              px: 4,
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "16px",
              "&:hover": { background: "#B03A1F" },
            }}
          >
            careers@nomadictownies.com
          </Button>
        </Box>

        <Footer />
      </Box>
    </>
  );
};

export default Careers;
