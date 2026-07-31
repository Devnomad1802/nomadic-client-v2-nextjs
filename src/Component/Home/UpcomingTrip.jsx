"use client";

import { Box, Container, Typography } from "@mui/material";
// Import Swiper React components

import UpcommingTab from "../../SmallComponents/Tabs/UpCommingTabs/UpcommingTab";

const UpcomingTrip = ({ searchQuery = "" }) => {
  return (
    <Box>
      <Container sx={{ pb: { xs: 5, md: 3 }, pt: { xs: 5, md: 7 } }}>
        <Box>
          <Typography
            sx={{
              color: "#4B5563",
              // display: "flex",
              // textAlign: "center",
              fontWeight: "bold",
              fontFamily: "Playfair",
              fontSize: { xs: "22px", sm: "28px", md: "28px", lg: "48px" },
              fontStyle: "normal",
              lineHeight: "140%",
              mb: { xs: 2, md: 5 },
              mt: { xs: 2, md: 0 },
            }}
          >
            Featured Experiences
          </Typography>
        </Box>

        <UpcommingTab searchQuery={searchQuery} />
      </Container>
    </Box>
  );
};

export default UpcomingTrip;
