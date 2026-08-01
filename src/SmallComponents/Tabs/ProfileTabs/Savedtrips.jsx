"use client";

import { Box, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Link } from "react-router-dom";
import { useGetBookmarkedTripsMutation } from "../../../services";
import { useSelector } from "react-redux";
import { extractRating } from "../../../utils";


const Savedtrips = () => {
  const currentDate = new Date();
  const { userDbData } = useSelector((store) => store.global);
  const [getBookmarkedTrips] = useGetBookmarkedTripsMutation();
  const [favoriteTrip, setFavoriteTrip] = useState([]);
  const getFavTrip = useCallback(async () => {
    if (userDbData && userDbData._id) {
      try {
        const res = await getBookmarkedTrips({
          userId: userDbData._id,
        }).unwrap();

        const parsedData = res.map((trip) => {
          return {
            ...trip,
            selectDate: trip.selectDate ? JSON.parse(trip.selectDate) : [],
          };
        });
        setFavoriteTrip(parsedData);
      } catch (error) {
        console.error("error", error);
      }
    }
  }, [getBookmarkedTrips, userDbData]);

  useEffect(() => {
    getFavTrip();
  }, [getFavTrip]);

  return (
    <Box>
      <Grid container sx={{ display: "flex", justifyContent: "space-between" }}>
        {favoriteTrip &&
          favoriteTrip.map((item, index) => {
            return (
              <Grid
                key={index}
                component={Link}
                to={`/trips/${item.seoSlug || item._id}`}
                item
                xs={12}
                md={5.7}
                sx={{
                  height: "410px",
                  width: "100%",
                  color: "#000",
                  boxShadow: 1,
                  my: 3,
                  borderRadius: "16px",
                  textDecoration: "none",
                  background: "#FBF6EE",
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
                  <img
                    src={`${item?.cardImage}`}
                    // src="/uploads/1711220626770.png"
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
                        &#8377; {item?.price} / Person
                      </Typography>
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
                        style={{ color: "#F0A03C", fontSize: "25px" }}
                      />
                      <Typography
                        sx={{
                          color: "#F0A03C",
                          fontSize: "18px",
                          fontWeight: 500,
                        }}
                      >
                        {extractRating(item?.ratings)}
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
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                      overflow: "hidden", // Add this line
                    }}
                  >
                    {item?.title}
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
                      {item?.location}
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
                      <CalendarMonthRoundedIcon sx={{ color: "#5A5247" }} />
                      <Typography
                        sx={{
                          color: "#5A5247",
                          fontSize: { xs: "14px", sm: "16px" },
                        }}
                      >
                        {Array.isArray(item?.selectDate) &&
                          item?.selectDate
                            .map((item) => {
                              const batchDate = new Date(item?.BatchDate);
                              return {
                                batchDate,
                                difference: Math.abs(batchDate - currentDate), // Absolute difference
                              };
                            })
                            .sort((a, b) => a.difference - b.difference)
                            .filter(
                              (dateObject) => dateObject.batchDate > currentDate
                            )
                            .slice(0, 1) // Get the closest date
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
                      <AccessTimeRoundedIcon style={{ color: "#5A5247" }} />
                      <Typography
                        sx={{
                          color: "#5A5247",
                          fontSize: { xs: "14px", sm: "16px" },
                        }}
                      >
                        {item?.nights}N / {item?.days}D
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
};

export default Savedtrips;
