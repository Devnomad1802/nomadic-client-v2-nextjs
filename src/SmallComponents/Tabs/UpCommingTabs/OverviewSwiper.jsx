"use client";

import "swiper/css";
import "swiper/css/pagination";
import "../../styles.css";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box, Typography } from "@mui/material";
import BasicRating from "../../Rating";
import { useGetAllReviewsQuery } from "../../../services";

const OverviewSwiper = () => {
  const { data } = useGetAllReviewsQuery();
  const reviews = data?.data;

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Box sx={{ color: "#fff" }}>
      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="mySwiper"
        style={{ color: "#000" }}
      >
        {reviews.slice(0, 10).map((review, index) => (
          <SwiperSlide
            key={review._id || index}
            style={{ background: "none", maxWidth: "600px" }}
          >
            <Box
              sx={{
                width: "100%",
                border: "1px solid #F3F4F6",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                p: 3,
                mb: 5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#CF4A2C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "16px",
                    fontFamily: "Inter",
                    flexShrink: 0,
                  }}
                >
                  {(review.Name || review.Title || "A").charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: "#1F2937",
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "Inter",
                    }}
                  >
                    {review.Name || review.Title || "Traveler"}
                  </Typography>
                  {review.Designation && (
                    <Typography
                      sx={{
                        color: "#9CA3AF",
                        fontSize: "12px",
                        fontFamily: "Inter",
                      }}
                    >
                      {review.Designation}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography
                sx={{
                  color: "#4B5563",
                  fontSize: "14px",
                  fontFamily: "Inter",
                  lineHeight: "160%",
                }}
              >
                {review.Description || review.Review || "Great experience!"}
              </Typography>
              <BasicRating />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default OverviewSwiper;
