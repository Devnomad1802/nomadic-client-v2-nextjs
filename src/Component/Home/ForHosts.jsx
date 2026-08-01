"use client";

import { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import EnquirNow from "../../Modals/EnquirNow";

const ForHosts = () => {
  const [opene, setOpene] = useState(false);
  const toggelModele = () => setOpene(!opene);

  return (
    <Box sx={{ py: { xs: 6, md: 9 }, backgroundColor: "#27272A" }}>
      <EnquirNow opene={opene} setOpene={setOpene} toggelModele={toggelModele} />
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: { xs: "12px", md: "13px" },
              color: "#F59E0B",
              mb: 1.5,
            }}
          >
            For Hosts
          </Typography>
          <Typography
            sx={{
              fontFamily: "Playfair",
              fontWeight: "bold",
              color: "#fff",
              fontSize: { xs: "26px", md: "40px" },
              lineHeight: "130%",
              mb: 2,
            }}
          >
            Run experiences you love. We bring the travelers.
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter",
              color: "rgba(255,255,255,0.8)",
              fontSize: { xs: "15px", md: "18px" },
              lineHeight: "150%",
              maxWidth: "640px",
              margin: "0 auto",
              mb: 4,
            }}
          >
            Nomadic Townies is a curated marketplace — you create meaningful trips,
            retreats and workshops, and we handle discovery, trust and bookings so you
            can focus on hosting.
          </Typography>
          <Button
            onClick={() => setOpene(true)}
            sx={{
              textTransform: "capitalize",
              fontSize: "15px",
              fontWeight: 600,
              backgroundColor: "#CF4A2C",
              color: "#fff",
              px: 4,
              py: 1.25,
              borderRadius: "999px",
              "&:hover": { backgroundColor: "#fff", color: "#27272A" },
            }}
          >
            Become a Host
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ForHosts;
