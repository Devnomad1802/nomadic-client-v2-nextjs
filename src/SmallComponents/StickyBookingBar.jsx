"use client";

import { Box, Button, Typography } from "@mui/material";

const StickyBookingBar = ({ price, strikePrice, onBookNow, onEnquire }) => {
  return (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: "#fff",
        borderTop: "1px solid #E4E4E7",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
        px: 2,
        py: 1.5,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      {/* Price section */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#27272A",
              fontFamily: "Inter",
              lineHeight: 1.2,
            }}
          >
            &#8377;{price}
          </Typography>
          {strikePrice && Number(strikePrice) > Number(price) && (
            <Typography
              sx={{
                fontSize: "13px",
                color: "#71717A",
                textDecoration: "line-through",
                fontFamily: "Inter",
              }}
            >
              &#8377;{strikePrice}
            </Typography>
          )}
        </Box>
        <Typography
          sx={{
            fontSize: "11px",
            color: "#52525B",
            fontFamily: "Inter",
          }}
        >
          per person
        </Typography>
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        {onEnquire && (
          <Button
            onClick={onEnquire}
            variant="outlined"
            sx={{
              borderColor: "#CF4A2C",
              color: "#CF4A2C",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              fontFamily: "Inter",
              px: 2,
              py: 1,
              minWidth: "auto",
              "&:hover": {
                background: "rgba(205,72,42,0.05)",
                borderColor: "#B03A1F",
              },
            }}
          >
            Enquire
          </Button>
        )}
        <Button
          onClick={onBookNow}
          sx={{
            background: "#CF4A2C",
            color: "#fff",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            fontFamily: "Inter",
            px: 3,
            py: 1,
            "&:hover": { background: "#B03A1F" },
          }}
        >
          Book Now
        </Button>
      </Box>
    </Box>
  );
};

export default StickyBookingBar;
