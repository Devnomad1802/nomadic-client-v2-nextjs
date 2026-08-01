"use client";

import {
  Box,
  Container,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./style.css";

// import required modules
import { Navigation, Pagination, Mousewheel, Keyboard } from "swiper/modules";
import { array } from "../../Constant/UpcomingConstant";

const Upcimming = () => {
  const matches = useMediaQuery("(min-width:900px)");
  const matches2 = useMediaQuery("(min-width:1200px)");
  return (
    <Box
      sx={{
        py: { xs: 5, md: 10 },
        maxWidth: "lg",
        mx: "auto",
        px: 1.2,
      }}
    >
      <Typography
        sx={{
          color: "#5A5247",
          // display: "flex",
          textAlign: { xs: "center", md: "left" },
          fontFamily: "Playfair",
          fontSize: { xs: "22px", sm: "28px", md: "28px" },
          fontStyle: "normal",
          fontWeight: 500,
          lineHeight: "140%",

          mb: { xs: 2, md: 5 },
          mt: { xs: 3 },
        }}
      >
        Upcoming Trips
      </Typography>
      <Swiper
        cssMode={true}
        navigation={true}
        // pagination={true}
        mousewheel={true}
        keyboard={true}
        modules={[Navigation, Mousewheel, Keyboard]}
        slidesPerView={matches ? (matches2 ? 3 : 2.5) : 1}
        spaceBetween={matches ? 20 : 20}
        style={{
          paddingLeft: "15px",
          paddingRight: "15px",
          paddingBottom: "0px",
        }}
      >
        <Grid
          container
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {array.map(
            (
              { date, heading, location, person, rateing, time, id, img },
              index
            ) => {
              return (
                <>
                  <SwiperSlide key={index}>
                    <Grid
                      component={Link}
                      to={`/trips/${id?.seoSlug || id}`}
                      item
                      xs={12}
                      sm={5.7}
                      md={3.8}
                      sx={{
                        height: "410px",
                        width: "100%",
                        color: "#000",
                        boxShadow: 1,
                        my: 3,
                        borderRadius: "16px",
                        textDecoration: "none",
                        background: "#FBFBFB",
                        // mx: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: { xs: "250px", sm: "258px" },
                          position: "relative",
                          borderRadius: "16px",
                        }}
                      >
                        <Box
                          sx={{
                            color: "#fff",

                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            borderRadius: "50%",
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{ background: "#F1F7F9" }}
                          >
                            <FavoriteRoundedIcon sx={{ color: "#CF4A2C" }} />
                          </IconButton>
                        </Box>
                        <img
                          src={img}
                          alt=""
                          srcSet=""
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "16px 16px 0px 0px",
                          }}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "0px 10px",
                            position: "absolute",
                            bottom: "0px",
                            left: "0px",

                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              padding: { xs: "6px 18px", sm: "10px 24px" },
                              background: "#FFD703",
                              borderRadius: "0px 8px 0px 0px",
                            }}
                          >
                            <Typography sx={{ color: "#000" }}>
                              {person}
                            </Typography>{" "}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              border: "1px solid #5A5247",
                              borderRadius: "15px",
                              background: "#5D5F71",
                              gap: "0px 3px",
                              px: 0.5,
                              py: 0.2,
                              mr: 2,
                            }}
                          >
                            <StarRoundedIcon
                              style={{ color: "#FBC800", fontSize: "25px" }}
                            />
                            <Typography
                              sx={{
                                color: "#FBC800",
                                fontSize: "18px",
                                fontWeight: 500,
                              }}
                            >
                              {rateing}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "start",
                          justifyContent: "flex-start",
                          p: { xs: 1.5, sm: 3 },
                          gap: "10px 0px",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#221C17",
                            fontWeight: 500,
                            fontSize: { xs: "18px", sm: "20px", lg: "23px" },
                            textAlign: "left",
                          }}
                        >
                          {heading}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            mt: 1,
                            gap: "0px 10px",
                            alignItems: "center",
                          }}
                        >
                          {" "}
                          <FmdGoodOutlinedIcon
                            sx={{
                              color: "#5A5247",
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#5A5247",
                              fontSize: { xs: "14px", sm: "16px" },
                            }}
                          >
                            {location}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",

                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: "0px 10px",
                              alignItems: "center",
                            }}
                          >
                            {" "}
                            <CalendarMonthRoundedIcon
                              sx={{ color: "#5A5247" }}
                            />
                            <Typography
                              sx={{
                                color: "#5A5247",
                                fontSize: { xs: "14px", sm: "16px" },
                              }}
                            >
                              {date}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              border: "1px solid #F1EADD",
                              borderRadius: "15px",
                              background: "#FBF6EE",
                              alignItems: "center",
                              px: 0.5,
                              py: 0.2,
                            }}
                          >
                            <AccessTimeRoundedIcon
                              style={{ color: "#5A5247" }}
                            />
                            <Typography
                              sx={{
                                color: "#5A5247",
                                fontSize: { xs: "14px", sm: "16px" },
                              }}
                            >
                              {time}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </SwiperSlide>
                </>
              );
            }
          )}
        </Grid>
      </Swiper>
    </Box>
  );
};

export default Upcimming;
