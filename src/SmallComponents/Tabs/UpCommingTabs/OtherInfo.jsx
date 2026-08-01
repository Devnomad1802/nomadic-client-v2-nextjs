"use client";

import React from "react";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import { Box, Container, Grid, Typography } from "@mui/material";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";

const array1 = [
  {
    title: "Things to Carry",
    textarray: [
      {
        typo1:
          "Authentic Government ID Card - Passport: Ensure that your passport is valid for at least 6 months from the date of departure from India. This is a requirement for entry into Bhutan. ",
      },
      {
        typo1:
          "Covid Vaccination Certificate: As part of the ongoing safety measures, please carry a valid Covid vaccination certificate. This is essential for your travel and stay in Bhutan. ",
      },
      {
        typo1:
          "Departure Time from Bagdogra Airport to Phuentsholing: Please note that the departure time from Bagdogra airport to Phuentsholing is approximately 12pm. Kindly plan your travel and arrival accordingly. ",
      },
      {
        typo1:
          "Having these essentials ready will help ensure a smooth and enjoyable travel experience to the beautiful land of Bhutan",
      },
    ],
  },
];
const array2 = [
  {
    title: "Cancellation",
    textarray: [
      {
        typo1:
          "Lorem ipsum dolor sit amet consectetur. Pulvinar vestibulum erat mi massa massa ultrices tincidunt blandit pulvinar. I ",
      },
      {
        typo1:
          "Lorem ipsum dolor sit amet consectetur. Pulvinar vestibulum erat mi massa massa ultrices tincidunt blandit pulvinar. I ",
      },
    ],
  },
];

const OtherInfo = ({ ThingsToCarry, Cancellation }) => {
  var sentences = ThingsToCarry.split(".");
  var cancellation = Cancellation.split(".");
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
            mt: 3,
          }}
        >
          Other Info
        </Typography>
        <Box>
          <Grid container>
            <Grid item xs={12} md={12} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <Box>
                <Typography
                  sx={{
                    color: "#18181B",
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "140%",
                    textAlign: "left",
                    p: { xs: 1, sm: 2, md: 3 },
                  }}
                >
                  Things to Carry
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
                        sx={{ color: "#52525B", fontSize: "7px", mt: 1 }}
                      />
                      <Typography sx={{ color: "#52525B", textAlign: "left" }}>
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
            <Grid item xs={12} md={12} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <Box>
                <Typography
                  sx={{
                    color: "#18181B",
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "140%",
                    textAlign: "left",
                    p: { xs: 1, sm: 2, md: 3 },
                  }}
                >
                  Cancellation
                </Typography>
                {cancellation?.map((item, index2) => {
                  return (
                    <Box
                      key={index2}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "start",
                        gap: "0px 10px",
                        ml: { xs: 1, sm: 2, md: 3 },
                        my: 0.5,
                      }}
                    >
                      <CircleRoundedIcon
                        sx={{ color: "#52525B", fontSize: "7px", mt: 1 }}
                      />
                      <Typography sx={{ color: "#52525B", textAlign: "left" }}>
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

export default OtherInfo;
