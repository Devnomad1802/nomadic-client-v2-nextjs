"use client";

import {
  Box,
  Button,
  Typography,
  IconButton,
  Stack,
  Container,
} from "@mui/material";
import "swiper/css";
import "swiper/css/navigation";
import "./BannerStyle.css";
// import required modules
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { useGetTrendingTripsQuery } from "../../services";
import { useEffect, useState, useRef } from "react";
import { extractRating } from "../../utils";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StarIcon from "@mui/icons-material/Star";
import { hostFlag, persent } from "../../Images";

const Banner = () => {
  const { data } = useGetTrendingTripsQuery();
  const [TrendingData, setTrendingData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (data?.data) {
      const parsedData = data.data.map((trip) => ({
        ...trip,
        selectDate: trip.selectDate ? JSON.parse(trip.selectDate) : [],
      }));
      setTrendingData(parsedData);
    }
  }, [data]);

  return (
    <Container sx={{ position: "relative", width: "100%", height: "450px" }}>
      <Swiper
        loop
        slidesPerView={1}
        spaceBetween={0}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        pagination={false}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        className="mySwiper"
        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
        style={{ height: "100%" }}
      >
        {TrendingData?.map((item, index) => {
          const rating = extractRating(item?.ratings);

          return (
            <SwiperSlide key={index}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "420px",
                  backgroundImage: `url(${item?.bannerImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  borderRadius: "32px",
                  overflow: "hidden",

                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
                    zIndex: 1,
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexDirection: "column", paddingLeft: "30px", paddingTop: "20px" }}>

                  {/* Discount Badge */}
                  {item?.tripOff && (
                    <Box
                      sx={{
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        // gap: 1.5,
                        backgroundColor: "#fff",
                        px: 1,
                        py: 0.5,
                        borderRadius: "14.97px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {/* Orange Starburst Icon */}
                      <Box
                        sx={{
                          position: "relative",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img src={persent} alt="" srcSet="" style={{ width: "25px", height: "25px" }} />

                      </Box>
                      <Typography
                        sx={{
                          color: "#3C3228",
                          fontSize: { xs: "11px", sm: "14px", md: "14px" },
                          fontWeight: "700",
                          letterSpacing: "0.5px",
                          marginLeft: "5px",
                        }}
                      >
                        {item?.tripOff}% <span style={{ fontSize: "12px", fontWeight: "600" }}>OFF</span>
                      </Typography>
                    </Box>
                  )}

                  {/* Hosted by and Rating - Top Left */}
                  <Box
                    sx={{
                      marginTop: { xs: "10px", md: "80px" },
                      zIndex: 2,
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    {/* Hosted by */}
                    <Box
                      sx={{
                        padding: "5px", borderRadius: "40px", backgroundColor: "rgba(10, 10, 10, 0.5)", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.1)"

                      }}
                    >

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          // backgroundImage: `url(${hostbg})`,
                          backgroundColor: "#fff",
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                          height: "35px",
                          width: "fit-content",
                          // minWidth: "180px",
                          px: 1,
                          borderRadius: "20px",
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      >

                        <Typography
                          sx={{
                            color: "#3C3228",
                            fontSize: { xs: "11px", sm: "14px", md: "14px" },
                            fontWeight: "500",
                            display: "flex", gap: "5px", alignItems: "center"
                          }}
                        >
                          <img src={hostFlag} alt="" style={{ width: "12px" }} /> Hosted by:
                        </Typography>
                        <Typography
                          sx={{
                            color: "#3C3228",
                            fontSize: { xs: "11px", sm: "14px", md: "14px" },
                            fontWeight: "600",
                          }}
                        >
                          {item?.host?.hostName}
                        </Typography>

                      </Box>
                    </Box>

                    {/* Rating */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        px: 1,
                        py: 0.8,
                        borderRadius: "20px",
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    >
                      <StarIcon sx={{ fontSize: "20px", color: "#F4C95D" }} />
                      <Typography
                        sx={{
                          color: "#3C3228",
                          fontSize: { xs: "11px", sm: "14px", md: "14px" },
                          fontWeight: "600",
                        }}
                      >
                        {Number(rating)?.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>

                </Box>



                {/* Rating Section */}
                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: "130px", md: "180px" },
                    left: { xs: "16px", sm: "20px", md: "30px" },
                    right: { xs: "16px", sm: "20px", md: "30px" },
                    zIndex: 2,
                    width: { xs: "calc(100% - 32px)", sm: "calc(100% - 40px)", md: "auto" },
                  }}
                >


                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: { xs: "18px", md: "32px", lg: "48px" },
                      fontWeight: "bold",
                      lineHeight: "1.1",
                      fontFamily: "Inter",
                      my: 2,
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {item?.trendingHeading || item?.title || "Trip Title"}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: { xs: "13px", sm: "14px", md: "16px" },
                      lineHeight: "1.4",
                      textAlign: "left",
                      opacity: 0.9,
                      maxWidth: { xs: "100%", sm: "100%", md: "600px" },
                      width: "100%",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item?.overview || ""}
                  </Typography>
                  {/* Pricing and Action Buttons Section */}
                  <Box
                    sx={{
                      mt: { xs: 2, sm: 2.5, md: 3 },
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "flex-end" },
                      width: "100%",
                      px: { xs: 0, sm: 1, md: 2 },
                      gap: { xs: 2, sm: 2, md: 0 },

                    }}
                  >
                    {/* Pricing Section - Bottom Left */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5, md: 2 }, width: "100%" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        {item?.strikePrice && (
                          <Typography
                            sx={{
                              color: "#fff",
                              fontSize: { xs: "11px", sm: "12px", md: "14px" },
                              textDecoration: "line-through",
                              opacity: 1,
                              mb: 0.5,
                              textAlign: "left",
                            }}
                          >
                            ₹{Number(item.strikePrice).toLocaleString('en-IN')}
                          </Typography>
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            gap: { xs: 1.5, sm: 2, md: 3 }
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#7DCD85",
                              fontSize: { xs: "20px", sm: "24px", md: "28px" },
                              fontWeight: "700",
                              lineHeight: "1",
                            }}
                          >
                            ₹{item?.price ? Number(item.price).toLocaleString('en-IN') : 'N/A'}
                            <Box component="span" sx={{
                              fontSize: { xs: "11px", sm: "12px", md: "14px" },
                              opacity: 0.8,
                              color: "#FBF6EE",
                              fontWeight: "500"
                            }}>/Person</Box>
                          </Typography>

                          {/* Action Buttons - Bottom Right */}
                          <Stack
                            direction={{ xs: "row", sm: "row" }}
                            spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                          >
                            <Button
                              component={Link}
                              to={`/trips/${item.seoSlug || item._id}`}
                              sx={{
                                backgroundColor: "#D55035",
                                color: "#fff",
                                px: { xs: 2, sm: 2.5, md: 3 },
                                py: { xs: 0.75, sm: 0.9, md: 1 },
                                borderRadius: { xs: "10px", sm: "11px", md: "12px" },
                                fontSize: { xs: "12px", sm: "13px", md: "14px" },
                                fontWeight: "600",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "#E55A2B",
                                },
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                width: { xs: "50%", sm: "auto" },
                                minWidth: { xs: "auto", sm: "120px" },
                              }}
                            >
                              Book Now
                              <ArrowForwardIosIcon sx={{ fontSize: { xs: "12px", sm: "13px", md: "14px" } }} />
                            </Button>

                            <Button
                              component={Link}
                              to={`/trips/${item.seoSlug || item._id}`}
                              sx={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                                color: "#fff",
                                px: { xs: 2, sm: 2.5, md: 3 },
                                py: { xs: 0.75, sm: 0.9, md: 1 },
                                borderRadius: { xs: "10px", sm: "11px", md: "12px" },
                                fontSize: { xs: "12px", sm: "13px", md: "14px" },
                                fontWeight: "600",
                                textTransform: "none",
                                border: "1px solid rgba(255,255,255,0.3)",
                                "&:hover": {
                                  backgroundColor: "rgba(255,255,255,0.3)",
                                },
                                width: { xs: "50%", sm: "auto" },
                                minWidth: { xs: "auto", sm: "120px" },
                              }}
                            >
                              Learn More
                            </Button>
                          </Stack>
                        </Box>

                      </Box>
                    </Box>
                  </Box>
                </Box>

              </Box>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Combined Navigation Control - Bottom Right */}
      <Box
        sx={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "50px",
          px: 1.5,
          py: 1,
        }}
      >
        {/* Previous Button */}
        <IconButton
          onClick={() => swiperRef.current?.slidePrev()}
          sx={{
            backgroundColor: "#fff",
            color: "#000",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "#F1EADD",
            },
            padding: 0,
          }}
        >
          <ArrowBackIosIcon sx={{ fontSize: "16px" }} />
        </IconButton>

        {/* Page Indicator */}
        <Typography
          sx={{
            color: "#fff",
            fontSize: "14px",
            fontWeight: "600",
            minWidth: "40px",
            textAlign: "center",
          }}
        >
          {currentSlide + 1}/{TrendingData.length || 1}
        </Typography>

        {/* Next Button */}
        <IconButton
          onClick={() => swiperRef.current?.slideNext()}
          sx={{
            backgroundColor: "#fff",
            color: "#000",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "#F1EADD",
            },
            padding: 0,
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: "16px" }} />
        </IconButton>
      </Box>

    </Container>
  );
};

export default Banner;
