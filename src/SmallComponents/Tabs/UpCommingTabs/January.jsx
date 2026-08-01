"use client";

/* eslint-disable react/prop-types */
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import PersonIcon from "@mui/icons-material/Person";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  Avatar,
  Box,
  Chip,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./style.css";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Keyboard, Mousewheel, Navigation } from "swiper/modules";
import {
  useGetBookmarkedTripsMutation,
  useUpdateBookmarkMutation,
} from "../../../services";
import { extractRating } from "../../../utils";

const January = ({ activeMonth, viewAll, searchQuery = "" }) => {
  const navigate = useNavigate();
  const matches = useMediaQuery("(min-width:900px)");
  const matches2 = useMediaQuery("(min-width:1200px)");
  const [favoriteArray, setFavoriteArray] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [getBookmarkedTrips] = useGetBookmarkedTripsMutation();
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const currentDate = new Date();

  const { userDbData } = useSelector((store) => store.global);

  const [updateBookmark] = useUpdateBookmarkMutation();
  const getFavTrip = useCallback(async () => {
    if (userDbData && userDbData._id) {
      try {
        const res = await getBookmarkedTrips({
          userId: userDbData._id,
        }).unwrap();

        const parsedData = res.map((trip) => trip._id);
        setFavoriteArray(parsedData);
      } catch (error) {
        console.error("error", error);
      }
    }
  }, [getBookmarkedTrips, userDbData]);

  useEffect(() => {
    getFavTrip();
  }, [getFavTrip]);

  useEffect(() => {
    if (activeMonth && favoriteArray) {
      const initialFavorites = activeMonth.map((trip) => {
        return favoriteArray.includes(trip._id);
      });
      setFavorites(initialFavorites);
    }
  }, [activeMonth, favoriteArray]);

  // Extract total seats from numberOfSeats JSON field
  const getTotalSeats = (trip) => {
    try {
      const seats = typeof trip?.numberOfSeats === "string"
        ? JSON.parse(trip.numberOfSeats)
        : trip?.numberOfSeats;
      if (Array.isArray(seats) && seats.length > 0) {
        return Number(seats[0]?.batchSeats) || 0;
      }
      return 0;
    } catch { return 0; }
  };

  // Filter trips by search query (title, location, category)
  const filteredTrips = useMemo(() => {
    if (!activeMonth) return [];
    if (!searchQuery || !searchQuery.trim()) return activeMonth;
    const q = searchQuery.toLowerCase().trim();
    return activeMonth.filter(
      (trip) =>
        trip?.title?.toLowerCase().includes(q) ||
        trip?.location?.toLowerCase().includes(q) ||
        (Array.isArray(trip?.categories) &&
          trip.categories.some((c) => c?.toLowerCase().includes(q)))
    );
  }, [activeMonth, searchQuery]);

  const addToFavorites = async (tripId, index) => {
    if (userDbData) {
      // Check if tripId is already in favoriteArray (capture original state)
      const isFavorite = favoriteArray?.includes(tripId);

      try {
        // Optimistically update UI first
        setFavorites((prevFavorites) => {
          const newFavorites = [...prevFavorites];
          newFavorites[index] = !isFavorite;
          return newFavorites;
        });

        // Update favoriteArray immediately
        if (isFavorite) {
          setFavoriteArray((prev) => prev.filter((id) => id !== tripId));
        } else {
          setFavoriteArray((prev) => [...prev, tripId]);
        }

        // Make API call
        const res = await updateBookmark({
          userId: userDbData._id,
          bookmark: !isFavorite,
          tripId: tripId,
        }).unwrap();


        // Refresh favorite list from server to ensure sync
        await getFavTrip();
      } catch (error) {

        // Revert optimistic update on error - restore to original state (isFavorite)
        setFavorites((prevFavorites) => {
          const newFavorites = [...prevFavorites];
          newFavorites[index] = isFavorite;
          return newFavorites;
        });

        // Revert favoriteArray to original state
        if (isFavorite) {
          // Was a favorite, add it back
          setFavoriteArray((prev) => {
            if (!prev.includes(tripId)) {
              return [...prev, tripId];
            }
            return prev;
          });
        } else {
          // Was not a favorite, remove it
          setFavoriteArray((prev) => prev.filter((id) => id !== tripId));
        }
      }
    } else {
      alert("Please login to your account to add favorites");
    }
  };

  return (
    <>
      {!viewAll ? (
        <>
          <Box
            sx={{
              position: "relative",
              width: "100%",
            }}
          >
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              cssMode={true}
              navigation={true}
              mousewheel={true}
              keyboard={true}
              modules={[Navigation, Mousewheel, Keyboard]}
              slidesPerView={matches ? (matches2 ? 3 : 2.5) : 1}
              spaceBetween={matches ? 30 : 30}
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
                {filteredTrips &&
                  filteredTrips.map((trip, index) => {
                    const futureDates = trip?.selectDate.filter((item) => {
                      const batchDate = new Date(item?.BatchDate);
                      return batchDate > currentDate;
                    });

                    const numberOfFutureDates = futureDates.length - 1;

                    return (
                      <SwiperSlide key={index} style={{ position: "relative" }}>
                        <Grid
                          item
                          xs={12}
                          sm={5.7}
                          md={3.8}
                          component={Link}
                          to={`/trips/${trip.seoSlug || trip._id}`}
                          sx={{
                            height: "420px",
                            minHeight: "400px",
                            width: "100%",
                            color: "#000",
                            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                            my: 2,
                            borderRadius: "16px",
                            textDecoration: "none",
                            background: "#FFFFFF",
                            overflow: "hidden",
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.12)",
                            },
                            cursor: "pointer",
                          }}
                        >
                          {/* Image Section */}
                          <Box
                            sx={{
                              width: "100%",
                              height: { xs: "180px", sm: "180px" },
                              position: "relative",
                              borderRadius: "16px 16px 0px 0px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={`${trip?.cardImage}`}
                              alt={trip?.title}
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: "brightness(0.9)",
                              }}
                            />

                            {/* Urgency badge — bottom-left to avoid heart icon overlap */}
                            {getTotalSeats(trip) > 0 && getTotalSeats(trip) <= 5 && (
                              <Chip
                                label={`Only ${getTotalSeats(trip)} seats left`}
                                size="small"
                                sx={{
                                  position: "absolute",
                                  bottom: 10,
                                  left: 10,
                                  zIndex: 2,
                                  background: "#EF4444",
                                  color: "#fff",
                                  fontWeight: 700,
                                  fontSize: "11px",
                                  height: "24px",
                                  fontFamily: "Inter",
                                }}
                              />
                            )}

                            {/* Gradient Overlay for Text Readability */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "60%",
                                background:
                                  "linear-gradient(transparent, rgba(0,0,0,0.7))",
                              }}
                            />

                            {/* Title and Location - Overlay on Image */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: "16px",
                                left: "16px",
                                right: "16px",
                              }}
                            >
                              {/* <Typography
                              sx={{
                                color: "#FFFFFF",
                                fontWeight: 500,
                                fontSize: { xs: "14px", sm: "16px" },
                                lineHeight: "1.2",
                                mb: "4px",
                                textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                                textAlign: "left",
                              }}
                            >
                              {trip?.title}
                            </Typography> */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <FmdGoodOutlinedIcon
                                  sx={{
                                    color: "#FFFFFF",
                                    fontSize: "16px",
                                    filter:
                                      "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))",
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: "#FFFFFF",
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                                  }}
                                >
                                  {trip?.location}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Tags Section - Top Right */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                display: "flex",
                                flexDirection: "row",
                                gap: "4px",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                maxWidth: "200px",
                                justifyContent: "flex-end",
                              }}
                            >
                              {(() => {
                                // Parse specialties - handle both array and string formats
                                let specialties = [];

                                if (trip?.host?.specialties) {
                                  const hostSpecialties = trip.host.specialties;

                                  // Check if it's already an array
                                  if (Array.isArray(hostSpecialties)) {
                                    specialties = hostSpecialties.filter(item => item && typeof item === "string");
                                  }
                                  // Check if it's a string that needs parsing
                                  else if (typeof hostSpecialties === "string") {
                                    try {
                                      const parsed = JSON.parse(hostSpecialties);
                                      if (Array.isArray(parsed)) {
                                        specialties = parsed.filter(item => item && typeof item === "string");
                                      }
                                    } catch (e) {
                                      // If parsing fails, treat as single string
                                      specialties = hostSpecialties.trim() ? [hostSpecialties] : [];
                                    }
                                  }
                                }

                                // Limit to first 3 specialties to avoid overcrowding
                                const displaySpecialties = specialties.slice(0, 3);

                                // Don't render if no specialties
                                if (displaySpecialties.length === 0) {
                                  return null;
                                }

                                // Color palette for chips
                                const chipColors = [
                                  { bg: "#fff", color: "#000" },
                                  { bg: "#EFEAE1", color: "#424242" },
                                  { bg: "#FFF3E0", color: "#F57C00" },
                                ];

                                return displaySpecialties.map((specialty, index) => (
                                  <Chip
                                    key={`${trip?._id || index}-${index}`}
                                    label={specialty}
                                    size="small"
                                    sx={{
                                      backgroundColor: chipColors[index % chipColors.length].bg,
                                      color: chipColors[index % chipColors.length].color,
                                      fontSize: "9px",
                                      height: "18px",
                                      fontWeight: 500,
                                      boxShadow: "0px 5px 8px rgba(0,0,0,0.15)",
                                      backdropFilter: "blur(10px)",
                                    }}
                                  />
                                ));
                              })()}
                            </Box>

                            {/* Discount Tag - Right Edge */}
                            <Box
                              sx={{
                                position: "absolute",
                                right: "0px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                backgroundColor: "#FF6B35",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: "8px 0px 0px 8px",
                                fontSize: "13px",
                                fontWeight: 600,
                                boxShadow: "0px 4px 16px rgba(255, 107, 53, 0.4)",
                              }}
                            >
                              {trip?.tripOff}% OFF
                            </Box>

                            {/* Favorite Button */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: "12px",
                                left: "12px",
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{
                                  background: "rgba(255, 255, 255, 0.95)",
                                  backdropFilter: "blur(10px)",
                                  boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                                  "&:hover": {
                                    background: "rgba(255, 255, 255, 1)",
                                    transform: "scale(1.05)",
                                  },
                                  transition: "all 0.2s ease",
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToFavorites(trip?._id, index);
                                }}
                              >
                                {favorites[index] ? (
                                  <FavoriteRoundedIcon
                                    sx={{ color: "#C8462A", fontSize: "18px" }}
                                  />
                                ) : (
                                  <FavoriteBorderIcon
                                    sx={{ color: "#C8462A", fontSize: "18px" }}
                                  />
                                )}
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Content Section */}
                          <Box
                            sx={{
                              padding: { xs: "16px", sm: "20px" },
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                            }}
                          >
                            {/* Host and Rating */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Avatar
                                  src={`${trip.cardImage}`}
                                  sx={{ width: 24, height: 24 }}
                                >
                                  <PersonIcon />
                                </Avatar>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color: "#6B6355",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Hosted by:
                                  </Typography>
                                  <Typography
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigate(`/hosts/${trip?.host?.seoSlug || trip?.host?._id}`);
                                    }}
                                    sx={{
                                      textDecoration: "none",
                                      color: "#C8462A",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      cursor: "pointer",
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                    }}
                                  >
                                    {trip?.host?.hostName
                                      ? trip.host.hostName
                                        .split(" ")
                                        .slice(0, 2)
                                        .join(" ") +
                                      (trip.host.hostName.split(" ").length > 2
                                        ? "..."
                                        : "")
                                      : "Not Available"}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <StarRoundedIcon
                                  sx={{
                                    color: "#F59E0B",
                                    fontSize: "16px",
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: "#1E1C18",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                  }}
                                >
                                  {extractRating(trip?.ratings)}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography
                              sx={{
                                color: "#151515",
                                fontSize: "23px",
                                fontWeight: 400,
                                textAlign: "left",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                lineHeight: "1.4",

                              }}
                            >
                              {trip?.title}
                            </Typography>

                            {/* Features */}
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "nowrap",
                                gap: "6px",
                                overflow: "hidden",
                                width: "100%",
                              }}
                            >
                              {trip?.host?.specialties
                                ?.slice(0, 2)
                                .map((specialty, index) => (
                                  <Chip
                                    key={index}
                                    label={specialty}
                                    size="small"
                                    sx={{
                                      backgroundColor: "#EFEAE1",
                                      color: "#6B6355",
                                      fontSize: "11px",
                                      height: "24px",
                                      fontWeight: 400,
                                      flexShrink: 0,
                                      minWidth: "fit-content",
                                    }}
                                  />
                                ))}
                              {trip?.host?.specialties?.length > 2 && (
                                <Chip
                                  label={`+${trip.host.specialties.length - 2}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#E1DACE",
                                    color: "#6B6355",
                                    fontSize: "11px",
                                    height: "24px",
                                    fontWeight: 400,
                                    flexShrink: 0,
                                    minWidth: "fit-content",
                                  }}
                                />
                              )}
                            </Box>

                            {/* Date and Duration */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <CalendarMonthRoundedIcon
                                  sx={{
                                    color: "#6B6355",
                                    fontSize: "16px",
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: "#6B6355",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                  }}
                                >
                                  {Array.isArray(trip?.selectDate) &&
                                    trip?.selectDate
                                      .map((item) => {
                                        const batchDate = new Date(
                                          item?.BatchDate
                                        );
                                        return {
                                          batchDate,
                                          difference: Math.abs(
                                            batchDate - currentDate
                                          ),
                                        };
                                      })
                                      .sort((a, b) => a.difference - b.difference)
                                      .filter(
                                        (dateObject) =>
                                          dateObject.batchDate > currentDate
                                      )
                                      .slice(0, 1)
                                      .map((closestDateObject) =>
                                        closestDateObject.batchDate.toLocaleDateString(
                                          "en-US",
                                          {
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric",
                                          }
                                        )
                                      )}
                                  {numberOfFutureDates > 0
                                    ? ` +${numberOfFutureDates}`
                                    : ""}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <AccessTimeRoundedIcon
                                  sx={{
                                    color: "#6B6355",
                                    fontSize: "16px",
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: "#6B6355",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                  }}
                                >
                                  {trip?.nights}N / {trip?.days}D
                                </Typography>
                              </Box>
                            </Box>

                            {/* Pricing */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "8px",
                                mt: "8px",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#C8462A",
                                  fontSize: { xs: "20px", sm: "22px" },
                                  fontWeight: 700,
                                }}
                              >
                                ₹{trip?.price}
                              </Typography>
                              <Typography
                                sx={{
                                  color: "#857C6C",
                                  fontSize: "14px",
                                  textDecoration: "line-through",
                                }}
                              >
                                ₹{trip?.strikePrice}
                              </Typography>
                              <Typography
                                sx={{
                                  color: "#857C6C",
                                  fontSize: "12px",
                                }}
                              >
                                / person
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </SwiperSlide>
                    );
                  })}
              </Grid>
            </Swiper>

            {/* Custom Navigation Buttons */}
            <IconButton
              onClick={() => swiperRef.current?.slidePrev()}
              sx={{
                position: "absolute",
                left: { xs: "0px", md: "-10px" },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                backgroundColor: "#fff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
                width: { xs: "36px", md: "40px" },
                height: { xs: "36px", md: "40px" },
                "&:hover": {
                  backgroundColor: "#EFEAE1",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                },
                "&:disabled": {
                  opacity: 0.3,
                  cursor: "not-allowed",
                },
              }}
              disabled={isBeginning}
            >
              <ArrowBackIosIcon
                sx={{
                  fontSize: { xs: "16px", md: "18px" },
                  color: "#C8462A",
                }}
              />
            </IconButton>

            <IconButton
              onClick={() => swiperRef.current?.slideNext()}
              sx={{
                position: "absolute",
                right: { xs: "0px", md: "-10px" },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                backgroundColor: "#fff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
                width: { xs: "36px", md: "40px" },
                height: { xs: "36px", md: "40px" },
                "&:hover": {
                  backgroundColor: "#EFEAE1",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                },
                "&:disabled": {
                  opacity: 0.3,
                  cursor: "not-allowed",
                },
              }}
              disabled={isEnd}
            >
              <ArrowForwardIosIcon
                sx={{
                  fontSize: { xs: "16px", md: "18px" },
                  color: "#C8462A",
                }}
              />
            </IconButton>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            width: "100%",
            overflowX: "hidden",
            pr: 1,
          }}
        >
          <Grid
            container
            sx={{
              display: "flex",
              justifyContent: "space-between",
              overflowY: "auto",
              overflowX: "hidden",
              maxHeight: "600px",
              width: "100%",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#EFEAE1",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#CBC2B3",
                borderRadius: "10px",
                "&:hover": {
                  background: "#857C6C",
                },
              },
            }}
          >
            {filteredTrips &&
              filteredTrips.map((trip, index) => {
                const futureDates = trip?.selectDate.filter((item) => {
                  const batchDate = new Date(item?.BatchDate);
                  return batchDate > currentDate;
                });

                const numberOfFutureDates = futureDates.length - 1;

                return (
                  <Grid
                    item
                    xs={12}
                    sm={5.7}
                    md={3.8}
                    key={index}
                    style={{ position: "relative" }}
                  >
                    <Box
                      component={Link}
                      to={`/trips/${trip.seoSlug || trip._id}`}
                      sx={{
                        height: "450px",
                        minHeight: "400px",
                        width: "100%",
                        color: "#000",
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                        my: 2,
                        mx: 1,
                        borderRadius: "20px",
                        textDecoration: "none",
                        background: "#FFFFFF",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.12)",
                        },
                        cursor: "pointer",
                        display: "block",
                      }}
                    >
                      {/* Image Section */}
                      <Box
                        sx={{
                          width: "100%",
                          height: { xs: "220px", sm: "240px" },
                          position: "relative",
                          borderRadius: "16px 16px 0px 0px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={`${trip.cardImage}`}
                          alt={trip?.title}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: "brightness(0.85)",
                          }}
                        />

                        {/* Urgency badge — bottom-left to avoid heart icon overlap */}
                        {getTotalSeats(trip) > 0 && getTotalSeats(trip) <= 5 && (
                          <Chip
                            label={`Only ${getTotalSeats(trip)} seats left`}
                            size="small"
                            sx={{
                              position: "absolute",
                              bottom: 10,
                              left: 10,
                              zIndex: 2,
                              background: "#EF4444",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "11px",
                              height: "24px",
                              fontFamily: "Inter",
                            }}
                          />
                        )}

                        {/* Gradient Overlay for Text Readability */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "70%",
                            background:
                              "linear-gradient(transparent, rgba(0,0,0,0.8))",
                          }}
                        />

                        {/* Title and Location - Overlay on Image */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: "16px",
                            left: "16px",
                            right: "16px",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#FFFFFF",
                              fontWeight: 700,
                              fontSize: { xs: "18px", sm: "20px" },
                              lineHeight: "1.2",
                              mb: "4px",
                              textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                              textAlign: "left",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {trip?.title}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <FmdGoodOutlinedIcon
                              sx={{
                                color: "#FFFFFF",
                                fontSize: "16px",
                                filter:
                                  "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))",
                              }}
                            />
                            <Typography
                              sx={{
                                color: "#FFFFFF",
                                fontSize: "14px",
                                fontWeight: 500,
                                textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                              }}
                            >
                              {trip?.location}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Tags Section - Top Right */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            display: "flex",
                            flexDirection: "row",
                            gap: "4px",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            maxWidth: "200px",
                            justifyContent: "flex-end",
                          }}
                        >
                          {(() => {
                            // Parse specialties - handle both array and string formats
                            let specialties = [];

                            if (trip?.host?.specialties) {
                              const hostSpecialties = trip.host.specialties;

                              // Check if it's already an array
                              if (Array.isArray(hostSpecialties)) {
                                specialties = hostSpecialties.filter(item => item && typeof item === "string");
                              }
                              // Check if it's a string that needs parsing
                              else if (typeof hostSpecialties === "string") {
                                try {
                                  const parsed = JSON.parse(hostSpecialties);
                                  if (Array.isArray(parsed)) {
                                    specialties = parsed.filter(item => item && typeof item === "string");
                                  }
                                } catch (e) {
                                  // If parsing fails, treat as single string
                                  specialties = hostSpecialties.trim() ? [hostSpecialties] : [];
                                }
                              }
                            }

                            // Limit to first 3 specialties to avoid overcrowding
                            const displaySpecialties = specialties.slice(0, 3);

                            // Don't render if no specialties
                            if (displaySpecialties.length === 0) {
                              return null;
                            }

                            // Color palette for chips
                            const chipColors = [
                              { bg: "#E3F2FD", color: "#1976D2" },
                              { bg: "#EFEAE1", color: "#424242" },
                              { bg: "#FFF3E0", color: "#F57C00" },
                            ];

                            return displaySpecialties.map((specialty, index) => (
                              <Chip
                                key={`${trip?._id || index}-${index}`}
                                label={specialty}
                                size="small"
                                sx={{
                                  backgroundColor: chipColors[index % chipColors.length].bg,
                                  color: chipColors[index % chipColors.length].color,
                                  fontSize: "9px",
                                  height: "18px",
                                  fontWeight: 500,
                                  boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                                  backdropFilter: "blur(10px)",
                                }}
                              />
                            ));
                          })()}
                        </Box>

                        {/* Discount Tag - Right Edge */}
                        {trip?.tripOff && (
                          <Box
                            sx={{
                              position: "absolute",
                              right: "0px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              backgroundColor: "#FF6B35",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "8px 0px 0px 8px",
                              fontSize: "12px",
                              fontWeight: 600,
                              boxShadow: "0px 4px 16px rgba(255, 107, 53, 0.4)",
                            }}
                          >
                            {trip?.tripOff}% OFF
                          </Box>
                        )}

                        {/* Favorite Button */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              background: "rgba(255, 255, 255, 0.95)",
                              backdropFilter: "blur(10px)",
                              boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                              "&:hover": {
                                background: "rgba(255, 255, 255, 1)",
                                transform: "scale(1.05)",
                              },
                              transition: "all 0.2s ease",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToFavorites(trip?._id, index);
                            }}
                          >
                            {favorites[index] ? (
                              <FavoriteRoundedIcon
                                sx={{ color: "#C8462A", fontSize: "18px" }}
                              />
                            ) : (
                              <FavoriteBorderIcon
                                sx={{ color: "#C8462A", fontSize: "18px" }}
                              />
                            )}
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Content Section */}
                      <Box
                        sx={{
                          padding: { xs: "16px", sm: "20px" },
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {/* Host and Rating */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Avatar
                              src={`${trip.cardImage}`}
                              sx={{ width: 24, height: 24 }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#6B6355",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                }}
                              >
                                Hosted by
                              </Typography>
                              <Typography
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/hosts/${trip?.host?.seoSlug || trip?.host?._id}`);
                                }}
                                sx={{
                                  textDecoration: "none",
                                  color: "#C8462A",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  "&:hover": {
                                    textDecoration: "underline",
                                  },
                                }}
                              >
                                {trip?.host?.hostName
                                  ? trip.host.hostName
                                    .split(" ")
                                    .slice(0, 2)
                                    .join(" ") +
                                  (trip.host.hostName.split(" ").length > 2
                                    ? "..."
                                    : "")
                                  : "Not Available"}
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <StarRoundedIcon
                              sx={{
                                color: "#F59E0B",
                                fontSize: "16px",
                              }}
                            />
                            <Typography
                              sx={{
                                color: "#1E1C18",
                                fontSize: "14px",
                                fontWeight: 500,
                              }}
                            >
                              {extractRating(trip?.ratings)} (156)
                            </Typography>
                          </Box>
                        </Box>

                        {/* Date and Duration */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <CalendarMonthRoundedIcon
                              sx={{
                                color: "#6B6355",
                                fontSize: "16px",
                              }}
                            />
                            <Typography
                              sx={{
                                color: "#6B6355",
                                fontSize: "14px",
                                fontWeight: 500,
                              }}
                            >
                              {Array.isArray(trip?.selectDate) &&
                                trip?.selectDate
                                  .map((item) => {
                                    const batchDate = new Date(item?.BatchDate);
                                    return {
                                      batchDate,
                                      difference: Math.abs(
                                        batchDate - currentDate
                                      ),
                                    };
                                  })
                                  .sort((a, b) => a.difference - b.difference)
                                  .filter(
                                    (dateObject) =>
                                      dateObject.batchDate > currentDate
                                  )
                                  .slice(0, 1)
                                  .map((closestDateObject) =>
                                    closestDateObject.batchDate.toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric",
                                      }
                                    )
                                  )}
                              {numberOfFutureDates > 0
                                ? ` +${numberOfFutureDates}`
                                : ""}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <AccessTimeRoundedIcon
                              sx={{
                                color: "#6B6355",
                                fontSize: "16px",
                              }}
                            />
                            <Typography
                              sx={{
                                color: "#6B6355",
                                fontSize: "14px",
                                fontWeight: 500,
                              }}
                            >
                              {trip?.nights}N / {trip?.days}D
                            </Typography>
                          </Box>
                        </Box>

                        {/* Features */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                          }}
                        >
                          <Chip
                            label="Adventure Activities"
                            size="small"
                            sx={{
                              backgroundColor: "#EFEAE1",
                              color: "#6B6355",
                              fontSize: "11px",
                              height: "24px",
                              fontWeight: 400,
                            }}
                          />
                          <Chip
                            label="Local Guide"
                            size="small"
                            sx={{
                              backgroundColor: "#EFEAE1",
                              color: "#6B6355",
                              fontSize: "11px",
                              height: "24px",
                              fontWeight: 400,
                            }}
                          />
                          <Chip
                            label="Accommodation"
                            size="small"
                            sx={{
                              backgroundColor: "#EFEAE1",
                              color: "#6B6355",
                              fontSize: "11px",
                              height: "24px",
                              fontWeight: 400,
                            }}
                          />
                        </Box>

                        {/* Pricing */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "8px",
                            mt: "8px",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#C8462A",
                              fontSize: { xs: "20px", sm: "22px" },
                              fontWeight: 700,
                            }}
                          >
                            ₹{trip?.price}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#857C6C",
                              fontSize: "14px",
                              textDecoration: "line-through",
                            }}
                          >
                            ₹{Math.round(trip?.price * 1.3)}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#857C6C",
                              fontSize: "12px",
                            }}
                          >
                            / person
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
      )}
    </>
  );
};

export default January;
