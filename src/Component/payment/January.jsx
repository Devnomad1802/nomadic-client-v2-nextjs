"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import React, { useState } from "react";

// eslint-disable-next-line react/prop-types
const January = ({ selectDate, setCardData, cardData }) => {
  const [id, setId] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = (ind) => {
    setId(ind);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  return (
    <Box sx={{ p: { xs: 0, sm: 2 } }}>
      {selectDate?.map((item, index) => {
        return (
          <Box
            key={index}
            onClick={() => {
              setCardData((prevData) => ({
                ...prevData,
                cardDate: item, // Update only the cardDate property
              }));
            }}
            sx={{
              border: id === index ? "1px solid red" : "1px solid #F4F4F5",
              px: 2,
              minHeight: "69px",
              borderRadius: { xs: "8px", md: "16px" },
              display: "flex",
              alignItems: "center",
              // flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              my: 1,
              gap: "20px 0px",
              py: { xs: 1, sm: 2, md: 3 },
              maxHeight: { xs: "auto", md: "65px" },
            }}
            onMouseEnter={(e) => {
              handleMouseEnter(index);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "13px",
                  sm: "16px",
                  md: "19px",
                  color: "#3F3F46",
                },
              }}
            >
              {" "}
              {new Date(item?.batchDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              -{" "}
              {new Date(item?.endSelectDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px 10px",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Typography
                sx={{
                  color: "#18181B",
                  fontSize: "12.5px",
                  display: {
                    xs: id === index ? "none" : "block",
                    sm: "block",
                  },
                }}
              >
                Few Seats Left / {item?.numberOfSeats}
              </Typography>

              {/* {id === index && (
                <Button
                  variant="simplebtn"
                  sx={{
                    background: "#CF4A2C",
                    color: "#fff",
                    fontSize: { xs: "14px", sm: "16px" },
                  }}
                >
                  Book Now
                </Button>
              )} */}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default January;
