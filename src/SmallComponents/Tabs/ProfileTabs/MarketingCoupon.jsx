"use client";

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoIcon from "@mui/icons-material/Info";

const array = [
  {
    value: "33",
    title: "Total Redeemed",
    info: "hlw",
    color: "#3E92CC",
    bl: "2px solid #D2D5DA",
  },
  {
    value: "23",
    title: "In Pending",
    info: "hlw",
    color: "#FBC800",
    bl: "2px solid #D2D5DA",
  },
  { value: "10", title: "Cancelled", info: "hlw", color: "#CF4A2C" },
];

const MarketingCoupon = () => {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: "20px", md: "28px" },
          color: "#000",
          textAlign: "left",
        }}
      >
        Marketing Coupon
      </Typography>
      <Box
        sx={{
          border: "1px solid #E6DDCF",
          borderRadius: "10px",
          p: { xs: 1, sm: 2, md: 3 },
          display: "flex",
          flexDirection: "column",
          gap: "30px 0px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "0px 10px",
              }}
            >
              <Typography
                sx={{ fontSize: { xs: "16px", md: "19px" }, color: "#5A5247" }}
              >
                John Deo
              </Typography>
              <Button
                sx={{
                  background: "#7DCD85",
                  borderRadius: "30px",
                  px: 2,
                  color: "#fff",
                }}
              >
                Active
              </Button>
            </Box>
            <Typography sx={{ color: "#8A8073", mt: 1 }}>
              CouponCreated on 22 September 2023, 1:00 PM
            </Typography>
          </Box>
          <Box
            sx={{
              border: "1px solid #E6DDCF",
              px: { xs: 1, md: 2 },
              color: "#F4C95D",
              display: "flex",
              alignItems: "center",
              py: 1,
              gap: "0px 30px",
            }}
          >
            MKNT10 <ContentCopyIcon sx={{ color: "#8A8073" }} />
          </Box>
        </Box>
        <Box
          sx={{
            border: "1px dashed #E6DDCF",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {" "}
          {array.map((item, index) => {
            return (
              <Box
                key={index}
                sx={{
                  borderRight: { xs: "none", md: item.bl },
                  p: { xs: 1, md: 2 },
                }}
              >
                <Typography
                  sx={{
                    color: item.color,
                    fontSize: { xs: "17px", sm: "20px", md: "35px" },
                    textAlign: "left",
                    fontWeight: 500,
                  }}
                >
                  {item.value}
                </Typography>
                <Box sx={{ display: "flex", gap: "0px 10px", mt: 2 }}>
                  <Typography sx={{ color: "#726A5E" }}>
                    {item.title}
                  </Typography>
                  <InfoIcon sx={{ color: "#726A5E" }} />
                </Box>
              </Box>
            );
          })}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px 0px" }}>
          <Typography
            sx={{
              color: "#726A5E",
              fontSize: { sx: "18px", sm: "20px", md: "22px" },
              textAlign: "start",
            }}
          >
            Coupon Description
          </Typography>
          <Typography sx={{ color: "#8A8073", textAlign: "start" }}>
            Lorem ipsum dolor sit amet consectetur. Pulvinar vestibulum erat mi
            massa massa ultrices tincidunt blandit pulvinar. Id pellentesque
            tincidunt vitae elementum. In tempor dignissim nulla id pulvinar.
            Quisque dolor id mauris tincidunt leo varius fa
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MarketingCoupon;
