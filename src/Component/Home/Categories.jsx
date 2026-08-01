"use client";

import AcUnitIcon from "@mui/icons-material/AcUnit";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GroupsIcon from "@mui/icons-material/Groups";
import TerrainIcon from "@mui/icons-material/Terrain";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useGetAllCategoriesQuery } from "../../services/categoriesApis";
import { CategoryCardSkeleton } from "../../SmallComponents/Skeletons";
import "./CategoriesStyle.css";

const Categories = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAllCategoriesQuery();
  const [categoriData, setCategoriData] = useState([]);

  useEffect(() => {
    if (data?.data) {
      setCategoriData(data.data);
    }
  }, [data]);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase();
    if (name?.includes("trek") || name?.includes("himalayan"))
      return <TerrainIcon />;
    if (name?.includes("snow") || name?.includes("winter"))
      return <AcUnitIcon />;
    if (name?.includes("motorcycle") || name?.includes("bike"))
      return <TwoWheelerIcon />;
    if (name?.includes("group") || name?.includes("adventure"))
      return <GroupsIcon />;
    return <GroupsIcon />; // Default icon
  };

  const getTripCount = (categoryName) => {
    // You can replace this with actual trip count from your data
    const counts = {
      trek: 12,
      himalayan: 12,
      snow: 8,
      winter: 8,
      motorcycle: 6,
      bike: 6,
      group: 15,
      adventure: 15,
    };

    const name = categoryName?.toLowerCase();
    for (const [key, count] of Object.entries(counts)) {
      if (name?.includes(key)) return count;
    }
    return 10; // Default count
  };

  const CategoriesDetail = (cInfo, clink) => {
    navigate(clink, { state: { item: cInfo } });
  };

  return (
    <Container maxWidth="xl" sx={{ zIndex: 1, pt: 10, position: "relative" }}>
      <Typography
        sx={{
          color: "#5A5247",
          textAlign: "center",
          fontFamily: "Playfair",
          fontSize: { xs: "22px", sm: "28px", md: "28px",lg:"48px" },
          fontStyle: "normal",
          fontWeight: "bold",
          lineHeight: "140%",
          mt: { xs: 2, md: 0 },
        }}
      >
        Explore by Experience
      </Typography>
      <Typography
        sx={{
          maxWidth: "700px",
          margin: "0 auto",
          color: "#5A5247",
          textAlign: "center",
          fontFamily: "Inter",
          fontSize: { xs: "16px",lg:"20px" },
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "140%",
          mb: { xs: 2, md: 5 },
          mt: { xs: 2, md: 1 },
        }}
      >
        Community trips, wellness &amp; yoga retreats, cultural immersions,
        creative workshops, festivals and more — each one curated and
        independently hosted.
      </Typography>

      {isLoading ? (
        <CategoryCardSkeleton count={3} />
      ) : (
      <Box sx={{ position: "relative" }}>
        <Swiper loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          navigation={{
            nextEl: ".categories-swiper-button-next",
            prevEl: ".categories-swiper-button-prev",
          }}
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={3}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 14,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
          }}
          className="categories-swiper"
        >
          {categoriData?.map((item, index) => {
            const tripCount = getTripCount(item?.Category);
            return (
              <SwiperSlide key={index} style={{ borderRadius: "20px" }}>
                <Box
                  onClick={() =>
                    CategoriesDetail(
                      item,
                      `/category/${item?.Category}`
                    )
                  }
                  sx={{
                    width: "100%",
                    height: "384px",
                    borderRadius: "16px",

                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "scale(1.02)",
                      transition: "transform 0.3s ease",
                    },
                  }}
                >
                  {/* Background Image */}
                  <img
                    src={`${item?.Banner_Image}`}
                    alt={item?.Category}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "16px",
                    }}
                  />

                  {/* Gradient Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "50%",
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.8))",
                      borderRadius: "0 0 16px 16px",
                    }}
                  />

                  {/* Price Tag - Top Right */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "16px",
                      right: "0px",
                      backgroundColor: "#fff",
                      borderRadius: "8px 0px 0px 8px",
                      padding: "8px 12px",
                      boxShadow: "0 2px 50px rgba(0,0,0,0.15)",
                      zIndex: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#5A5247",
                        fontWeight: "500",
                        lineHeight: 1,
                      }}
                    >
                      Starting from:
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        color: "#CF4A2C",
                        fontWeight: "700",
                        lineHeight: 1.2,
                        mt: 0.5,
                      }}
                    >
                      ₹{parseInt(item?.Starting_From || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Category Title and Subtitle - Bottom Left */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "50px",
                      left: "20px",
                      zIndex: 2,
                
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: "20px",
                        fontWeight: "700",
                        fontFamily: "Inter",
                        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                        lineHeight: 1.2,
                        mb: 0.5,
                        textTransform:"uppercase"
                      }}
                    >
                      {item?.Category}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: "400",
                        fontFamily: "Inter",
                        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        lineHeight: 1.3,
                        opacity: 0.9,
                      }}
                    >
                      {/* Adrenaline-pumping experiences */}
                    </Typography>
                  </Box>
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation Arrows */}
        <IconButton
          className="categories-swiper-button-prev"
          sx={{
            position: "absolute",
            left: "-15px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 3,
            backgroundColor: "#fff",
            color: "#3C3228",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <ArrowBackIosIcon sx={{ fontSize: "14px" }} />
        </IconButton>

        <IconButton
          className="categories-swiper-button-next"
          sx={{
            position: "absolute",
            right: "-15px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 3,
            backgroundColor: "#fff",
            color: "#3C3228",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: "14px" }} />
        </IconButton>
      </Box>
      )}

      <Button
        variant="simplebtn"
        sx={{
          mt: 5,
          zIndex: 1,
          backgroundColor: "#FF6B35",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#E55A2B",
          },
        }}
      >
        View All
      </Button>
    </Container>
  );
};

export default Categories;
