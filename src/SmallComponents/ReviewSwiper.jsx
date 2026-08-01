"use client";

/* eslint-disable react/prop-types */
import "swiper/css";
import "swiper/css/pagination";
import "./styles.css";
import { Container, Box, Typography, useMediaQuery } from "@mui/material";
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import BasicRating from "./Rating";

const ReviewSwiper = ({ reviesData }) => {
  const matches = useMediaQuery("(min-width:900px)");
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 5, sm: 8, md: 8 } }}>
      <Box>
        <Swiper
          slidesPerView={matches ? 3 : 1}
          spaceBetween={matches ? 24 : 16}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="mySwiper"
          style={{ paddingBottom: "48px" }}
        >
          {reviesData &&
            reviesData?.map((item, index) => (
              <SwiperSlide key={index} style={{ background: "none" }}>
                <Box
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "20px",
                    boxShadow: "0px 8px 32px rgba(0,0,0,0.10)",
                    width: "100%",
                    height: "392px",
                    display: "flex",
                    flexDirection: "column",
                    p: "32px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0px 16px 48px rgba(0,0,0,0.16)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: "16px",
                      mb: "24px",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        flexShrink: 0,
                        gap: "10px",
                      }}
                    >
                      <Box
                        sx={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "50%",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={`${item?.Profile_Image}`}
                          alt={item?.Name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <BasicRating ratings={item?.rating} />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        pt: "8px",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#1A1A2E",
                          fontWeight: 700,
                          fontSize: "17px",
                          fontFamily: "Inter",
                          lineHeight: "1.3",
                        }}
                      >
                        {item?.Name}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#726A5E",
                          fontSize: "13px",
                          fontFamily: "Inter",
                          lineHeight: "1.5",
                          mt: "4px",
                        }}
                      >
                        {item?.Job}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      color: "#5A5247",
                      fontSize: "14px",
                      fontFamily: "Inter",
                      lineHeight: "1.75",
                      textAlign: "left",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item?.Review}
                  </Typography>
                </Box>
              </SwiperSlide>
            ))}
        </Swiper>
      </Box>
    </Container>
  );
};

export default ReviewSwiper;
