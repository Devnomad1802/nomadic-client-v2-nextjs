"use client";

import { Box, Container, Grid, Typography } from "@mui/material";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";

const steps = [
  {
    icon: <TravelExploreOutlinedIcon sx={{ fontSize: 34 }} />,
    title: "Discover curated experiences",
    text: "Browse community trips, wellness retreats, cultural immersions, workshops and festivals — each one handpicked, not mass-produced.",
  },
  {
    icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 34 }} />,
    title: "Connect with vetted hosts",
    text: "Every experience is run by a passionate local host we've reviewed, so you travel with people who genuinely care about the journey.",
  },
  {
    icon: <EventAvailableOutlinedIcon sx={{ fontSize: 34 }} />,
    title: "Book with confidence",
    text: "Secure your spot in minutes, get the answers you need, and set off on an experience designed to be meaningful — not just another tour.",
  },
];

const HowItWorks = () => {
  return (
    <Box sx={{ py: { xs: 5, md: 8 }, backgroundColor: "#FAF7F5" }}>
      <Container maxWidth="lg">
        <Typography
          sx={{
            color: "#5A5247",
            textAlign: "center",
            fontFamily: "Playfair",
            fontSize: { xs: "22px", sm: "28px", lg: "40px" },
            fontWeight: "bold",
            lineHeight: "140%",
          }}
        >
          How Nomadic Townies Works
        </Typography>
        <Typography
          sx={{
            maxWidth: "720px",
            margin: "0 auto",
            mt: 1.5,
            mb: { xs: 4, md: 6 },
            color: "#726A5E",
            textAlign: "center",
            fontFamily: "Inter",
            fontSize: { xs: "16px", lg: "18px" },
            lineHeight: "150%",
          }}
        >
          A curated marketplace for transformative travel — independent hosts create the
          experiences, and we bring you the travelers.
        </Typography>

        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          {steps.map((step, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box
                sx={{
                  height: "100%",
                  backgroundColor: "#fff",
                  borderRadius: "16px",
                  p: { xs: 3, md: 4 },
                  textAlign: "center",
                  border: "1px solid #F0E9E5",
                  transition: "box-shadow .2s ease, transform .2s ease",
                  "&:hover": {
                    boxShadow: "0 12px 30px rgba(205,72,42,0.10)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: "rgba(236,63,24,0.08)",
                    color: "#E9622F",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 700,
                    fontSize: { xs: "18px", lg: "20px" },
                    color: "#3C3228",
                    mb: 1,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: { xs: "14px", lg: "15px" },
                    color: "#726A5E",
                    lineHeight: "150%",
                  }}
                >
                  {step.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;
