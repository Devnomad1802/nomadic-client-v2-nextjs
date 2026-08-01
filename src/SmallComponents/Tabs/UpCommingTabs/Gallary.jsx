"use client";

import { Box, Container, Typography, useMediaQuery } from "@mui/material";
import "swiper/css";
import "swiper/css/pagination";

import "../../styles.css";

// import required modules
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { gallary, t1 } from "../../../Images";

const Gallary = ({ Gallary }) => {
  const matches = useMediaQuery("(min-width:900px)");
  return (
    <Box>
      <Box sx={{ color: "#fff" }}>
        <Typography
          sx={{
            color: "#000",
            fontFamily: "Inter",
            fontSize: "23px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "140%",
            textAlign: { xs: "center", md: "left" },
            mb: 3,
          }}
        >
          Gallery
        </Typography>
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          className="mySwiper"
          style={{ color: "#000" }}
        >
          {Gallary &&
            Gallary.map((item, index) => {
              return (
                <SwiperSlide key={index} style={{ background: "none" }}>
                  <Box
                    sx={{
                      width: "100%",
                      // border: "1px solid #F4F4F5",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "30px 0px",
                      mb: 5,
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", md: "100%" },
                        height: { xs: "200px", md: "320px" },
                        borderRadius: { xs: "15px", md: "32px" },
                        // mx: "auto",
                      }}
                    >
                      <img
                        src={`${item}`}
                        alt=""
                        srcSet=""
                        style={{ width: "100%", borderRadius: "15px" }}
                      />
                    </Box>
                  </Box>
                </SwiperSlide>
              );
            })}
        </Swiper>
      </Box>
    </Box>
  );
};

export default Gallary;
