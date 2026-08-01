"use client";

import { Box, Container, Grid, Typography } from "@mui/material";
import React from "react";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";

const array = [
  {
    title: "Inclusion",
    textarray: [
      {
        typo1:
          "Accommodation on sharing basis at all destinations as per the itinerary.",
      },
      {
        typo1:
          "Breakfast and dinner .[ Dinner on Day 1, 2 meals (breakfast and dinner) on Days 2, 3, 4, 5, and 6, and 1 breakfast on Day 7 ] .",
      },
      {
        typo1:
          "Entry Permit for Bhutan for 6 days, including all Inner Line Permits.",
      },
      {
        typo1:
          "Comfortable Non-AC vehicle for all days as per the itinerary (Day 1 - Day 7).",
      },
      {
        typo1: "Reliable, experienced and adept English-speaking local guide.",
      },
      {
        typo1: "Travel Insurance.",
      },
      {
        typo1:
          "SDF (Bhutan Sustainable Development Fees) - 1200/- per night per person Driver charges, driver accommodation, fuel and inter-state toll",
      },
    ],
  },
];
const array2 = [
  {
    title: "Exclusion",
    textarray: [
      {
        typo1:
          "Personal expenses like Telephone, Laundry, Tips and Table Drinks etc.",
      },
      {
        typo1:
          " Laundry, Tips and Table Drinks etc. GST (5%) is applicable extra.",
      },
      {
        typo1:
          " Personal expenses like tips to drivers, camera/video camera charges, camel safari, river rafting, laundry, telephone bills, tips, etc.",
      },
      {
        typo1: "Any lunch and other meals not mentioned in experience inclusions.",
      },
      {
        typo1:
          "Any cost incurred due to extension,change of itinerary due to natural calamities,road, blocks,vehicle breakdown, union issues and factors beyond our control.",
      },
      {
        typo1:
          " Any Airfare / Rail fare other than what in mentioned in “Inclusions”",
      },
      {
        typo1: " Anything that is not mentioned in the Inclusion.",
      },
    ],
  },
];

const InclusionExclusion = ({ Inclusion, Exclusion }) => {
  var sentences = Inclusion.split(".");
  var exclusion = Exclusion.split(".");

  return (
    <>
      <Box sx={{}}>
        <Typography
          sx={{
            color: "#000",
            fontFamily: "Inter",
            fontSize: "23px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "140%",
            textAlign: { xs: "left", md: "left" },
          }}
        >
          Inclusion & Exclusion
        </Typography>
        <Box>
          <Grid container>
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                background: "#EFEAE1",
                border: "2px solid #EFEAE1",
                p: { xs: 1, sm: 2, md: 3 },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#1E1C18",
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "140%",
                    textAlign: "left",
                    p: { xs: 1, sm: 2, md: 3 },
                  }}
                >
                  Inclusion
                </Typography>
                {sentences?.map((item, index2) => {
                  return (
                    <Box
                      key={index2}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "start",
                        gap: "0px 10px",
                        ml: { xs: 1.5, sm: 2, md: 3 },
                        my: 0.5,
                      }}
                    >
                      <CircleRoundedIcon
                        sx={{ color: "#6B6355", fontSize: "7px", mt: 1 }}
                      />
                      <Typography sx={{ color: "#6B6355", textAlign: "left" }}>
                        {item}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box>
        <Box>
          <Grid container>
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                background: "#EFEAE1",
                border: "2px solid #EFEAE1",
                mt: 4,
              }}
            >
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <Typography
                  sx={{
                    color: "#1E1C18",
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "140%",
                    textAlign: "left",
                    p: { xs: 1, sm: 2, md: 3 },
                  }}
                >
                  Exclusion
                </Typography>
                {exclusion?.map((item, index2) => {
                  return (
                    <Box
                      key={index2}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "start",
                        gap: "0px 10px",
                        ml: { xs: 1.5, sm: 2, md: 3 },
                        my: 0.5,
                      }}
                    >
                      <CircleRoundedIcon
                        sx={{ color: "#6B6355", fontSize: "7px", mt: 1 }}
                      />
                      <Typography sx={{ color: "#6B6355", textAlign: "left" }}>
                        {item}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default InclusionExclusion;
