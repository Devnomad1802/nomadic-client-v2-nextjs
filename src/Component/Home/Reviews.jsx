"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReviewSwiper from "../../SmallComponents/ReviewSwiper";
import { Typography } from "@mui/material";
import Googlebanner from "../../SmallComponents/Googlebanner";
import { useGetAllReviewsQuery } from "../../services";

const Reviews = () => {
  const { isError, isFetching, isLoading, data } = useGetAllReviewsQuery();

  const [reviesData, setReviewsData] = useState([]);

  useEffect(() => {
    if (data) {
      setReviewsData(data?.data);
    }
  }, [data]);
  return (
    <Box sx={{ color: "#fff", background: "#FBF6EE", py: { xs: 10, md: 15 } }}>
   <Typography
          sx={{
            color: "#5A5247",
            textAlign: "center",
            // fontFamily: "Inter",
            fontFamily: "Playfair",
            fontSize: { xs: "22px", sm: "28px", md: "28px",lg:"48px" },
            fontStyle: "normal",
            fontWeight: "bold",
            lineHeight: "140%",
          mt: { xs: 2, md: 5},
          }}
        >
           Stories from Fellow Adventurers
        </Typography>
        <Typography
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            color: "#5A5247",
            textAlign: "center",
            // fontFamily: "Inter",
            fontFamily: "Inter",
            fontSize: { xs: "16px",lg:"20px" },
            fontStyle: "normal",
            fontWeight: "400",
            lineHeight: "140%",
            mb: { xs: 2, md: 5 },
            mt: { xs: 2, md: 1 },
          }}
        >
         Real experiences from traveler's who've embarked on unforgettable
         journeys with us.
        </Typography>






      <ReviewSwiper reviesData={reviesData} />
      {/* <Googlebanner bg="#FBF6EE" /> */}
    </Box>
  );
};

export default Reviews;
