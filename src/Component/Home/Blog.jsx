"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { BlogConstant } from "../../Constant/HomePageConstant";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import { blogsConstant } from "../../Constant/BlogsPageConstant";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";

// import required modules
import { Navigation, Pagination, Mousewheel, Keyboard } from "swiper/modules";
import { useGetAllBlogsQuery } from "../../services";
import { baseImage } from "../../utils";

const Blog = () => {
  const matches = useMediaQuery("(min-width:900px)");
  const matches2 = useMediaQuery("(min-width:1200px)");
  const { isError, isFetching, isLoading, data } = useGetAllBlogsQuery();

  const [blogData, setBlogData] = useState([]);

  useEffect(() => {
    if (data) {
      setBlogData(data?.data); // Assuming the structure of your data is { data: [...] }
    }
    window.scrollTo(0, 0);
  }, [data]);

  return (
    <Box sx={{ py: { xs: 10, md: 10 } }}>
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#4E483D",
                textAlign: "left",
                // fontFamily: "Inter",
                fontFamily: "Playfair",
                fontSize: { xs: "22px", sm: "28px", md: "28px" ,lg:"48px"},
                fontStyle: "normal",
                fontWeight: "bold",
                lineHeight: "140%",
                mt: { xs: 2, md: 0 },
              }}
            >
              Stories from the Community
            </Typography>
            <Typography
              sx={{
                maxWidth: "800px",
                margin: "0 auto",
                color: "#4E483D",
                textAlign: "left",
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
              Get inspired by our travelers' experiences and discover expert
              tips for your next adventure.
            </Typography>
          </Box>
          <Button
            sx={{
              background: "transparent",
              border: "1px solid #EE5634",
              color: "#EE5634",
              borderRadius: "32px",
              width: "150px",
              textAlign: "center",
            }}
          >
            View All Blogs
          </Button>
        </Box>
        <Box sx={{ color: "#000" }}>
          <Swiper
            cssMode={true}
            navigation={true}
            pagination={true}
            mousewheel={true}
            keyboard={true}
            modules={[Navigation, Pagination, Mousewheel, Keyboard]}
            slidesPerView={matches ? (matches2 ? 3 : 2.5) : 1}
            spaceBetween={matches ? 20 : 20}
            style={{
              paddingLeft: "15px",
              paddingRight: "15px",
              paddingBottom: "40px",
            }}
          >
            <Grid
              container
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {blogData &&
                blogData.map((item, index) => {
                  return (
                    <SwiperSlide key={index}>
                      <Grid
                        component={Link}
                        to={`/blog/Details/${item.seoSlug || item._id}`}
                        xs={12}
                        sm={5.7}
                        md={3.8}
                        sx={{
                          height: { xs: "422px", sm: "470px" },
                          width: "100%",
                          color: "#000",
                          boxShadow: 1,
                          textDecoration: "none",
                          my: 3,
                          borderRadius: "16px",
                          overflow: "hidden",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-5px)",
                            boxShadow: "0 5px 5px rgba(0,0,0,0.15)",
                            "& .blog-image": {
                              transform: "scale(1.05)",
                            },
                            "& .blog-content": {
                              backgroundColor: "#f8f9fa",
                            },
                            "& .read-more": {
                              color: "#C8462A",
                              transform: "translateX(4px)",
                            },
                          },
                        }}
                      >
                        <Box
                          className="blog-image"
                          sx={{
                            width: "100%",
                            height: { xs: "210px", sm: "278px" },
                            position: "relative",
                            borderRadius: "16px",
                            overflow: "hidden",
                            transition: "transform 0.3s ease-in-out",
                          }}
                        >
                          <img
                            src={`${item?.Banner_Image}`}
                            alt={item?.title ? `${item.title} - Nomadic Townies Blog` : "Travel blog post by Nomadic Townies"}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "16px 16px 0px 0px",
                              transition: "transform 0.3s ease-in-out",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-start",
                              alignItems: "center",
                              gap: "0px 8px",
                              position: "absolute",
                              bottom: "20px",
                              left: "20px",
                            }}
                          >
                            <FmdGoodOutlinedIcon sx={{ color: "#fff" }} />
                            <Typography
                              sx={{
                                fontSize: { xs: "14px", sm: "16px" },
                              }}
                            >
                              {item?.location}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          className="blog-content"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            justifyContent: "flex-start",
                            p: 3,
                            transition: "background-color 0.3s ease-in-out",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#1E1C18",
                              fontWeight: 500,
                              fontSize: { xs: "19px", sm: "20px", lg: "23px" },
                              textAlign: "left",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 1, // Limit to 2 lines
                              lineClamp: 1, // Fallback for older browsers
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              width: "100%",
                            }}
                          >
                            {item?.title} <br />
                          </Typography>
                          <Typography
                            sx={{ 
                              color: "#4E483D", 
                              textAlign: "left",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2.5,
                              lineClamp: 2.5,
                              textOverflow: "ellipsis",
                              lineHeight: 1.4,
                              maxHeight: "2.8em",
                            }}
                          >
                            {(() => {
                              const text = item?.description || "I had a Kasol Tosh Solo with Nomadic Travellers. everything was well arranged. our tour guide Abhishek..";
                              const words = text.split(' ');
                              if (words.length > 17) {
                                return words.slice(0, 17).join(' ') + '...';
                              }
                              return text;
                            })()}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#4E483D",
                                display: "flex",
                                alignItems: "center",
                                mt: 2,
                              }}
                            >
                              <CalendarMonthRoundedIcon
                                sx={{ color: "#4E483D" }}
                              />
                              {(() => {
                                const dateObj = new Date(item?.Date);
                                const day = dateObj.getDate();
                                const month = dateObj.toLocaleString("en-US", {
                                  month: "long",
                                });
                                const year = dateObj.getFullYear();

                                const getOrdinalSuffix = (n) => {
                                  const s = ["th", "st", "nd", "rd"],
                                    v = n % 100;
                                  return s[(v - 20) % 10] || s[v] || s[0];
                                };

                                const dayWithSuffix = `${day}${getOrdinalSuffix(
                                  day
                                )}`;
                                return `${dayWithSuffix} ${month} ${year}`;
                              })()}
                            </Typography>
                            <Link
                              className="read-more"
                              to={`/blog/Details/${item.seoSlug || item._id}`}
                              style={{
                                color: "#EE5634",
                                fontWeight: "600",
                                fontFamily: "Inter",
                                marginTop:'10px',
                                textDecoration:'none',
                                transition: "all 0.3s ease-in-out",
                              }}
                            >
                              Read More
                            </Link>
                          </Box>
                        </Box>
                      </Grid>
                    </SwiperSlide>
                  );
                })}
            </Grid>
          </Swiper>
        </Box>
      </Container>
    </Box>
  );
};

export default Blog;
