"use client";

import {
  Box,
  Dialog,
  Grid,
  Hidden,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";
import { signUpbg } from "../Images";
// eslint-disable-next-line react/display-name
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import Stepper1 from "./Stepper";
const Transition = React.forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

// eslint-disable-next-line camelcase, react/prop-types

const BookNowModal = ({ opens, setOpens, toggelModel }) => {
  const handleClose = () => setOpens(false);
  const [numberToConvert, setnumberToConvert] = useState(1200);
  function convertToCurrency(number, countryCode) {
    const supportedCurrencies = {
      us: "en-US",
      pak: "ur-PK",
      inr: "en-IN",
    };

    const locale = supportedCurrencies[countryCode] || "en-US";

    try {
      const formattedNumber = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: countryCode.toUpperCase(),
      }).format(number);

      return formattedNumber;
    } catch (error) {
      console.error("Error formatting number:", error);
      return number; // Return the original number if there's an error
    }
  }
  const convertedNumberINR = convertToCurrency(numberToConvert, "inr");
  const array = [
    {
      icon: <FmdGoodOutlinedIcon />,
      text: "Explore Bhutan’s Magic ! ",
    },
    {
      icon: <AccessTimeOutlinedIcon />,
      text: "Explore Bhutan’s Magic ! ",
    },
    {
      text: `${convertedNumberINR}/Person `,
    },
  ];

  return (
    <Box sx={{ position: "relative" }}>
      <Dialog
        open={opens}
        TransitionComponent={Transition}
        keepMounted
        fullWidth
        maxWidth="lg"
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          color: "#fff",
          "& .MuiDialog-paper": {
            // padding: "30px",
            mb: "0px",
            zIndex: 100,
            mx: "0px",
            width: "100%",
            p: { xs: 2, md: 4 },
            borderRadius: { xs: "16px 16px 0px 0px", sm: "24px" },
            border: "2px solid #FBFBFB",
            background: "#FBFBFB",
            overflowY: "auto",
            height: { xs: "auto", md: "auto" }, // Set an initial height
            position: "absolute", // Position absolutely
            // Align to the right
            bottom: { xs: "0%", md: "auto" }, // Align to the bottom for xs and center for md
            left: "50%", // Align to the left
            transform: "translateX(-50%)",
            "&::-webkit-scrollbar": {
              width: "3px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "none",
              borderRadius: "3px",
              height: "40px", // Adjust the height as needed
            },
            "& *": {
              scrollbarWidth: "auto",
              scrollbarColor: "none #ffffff",
            },
          },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: { xs: "column", md: "row" },
                gap: "0px 50px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "500",
                  fontSize: "28px",
                  color: "#000",
                  textAlign: "left",
                }}
              >
                Booking
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  flexWrap: "wrap",
                  gap: { xs: "10px 10px", md: "0px 10px" },
                  alignItems: "center",
                }}
              >
                {array.map(({ text, icon }, index) => {
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        gap: "0px 0px",
                        alignItems: "center",
                      }}
                    >
                      <IconButton>{icon}</IconButton>
                      <Typography sx={{ color: "#000" }}>{text}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
            <IconButton onClick={toggelModel} sx={{ ml: 2 }}>
              <CloseIcon sx={{ color: "#393938" }} />
            </IconButton>
          </Box>
          <Stepper1 />
        </Box>
      </Dialog>
    </Box>
  );
};

export default BookNowModal;
