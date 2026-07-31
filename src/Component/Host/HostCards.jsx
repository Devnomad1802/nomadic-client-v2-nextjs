"use client";

import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import { Link } from "react-router-dom";
import { useGetHostTripsQuery } from "../../services";
import { getCleanRating, extractDate, extractSeats, extractArrayData } from "../../utils";
import PropTypes from "prop-types";

const HostCards = ({ hostData }) => {
  const { data: tripsData, isLoading, error } = useGetHostTripsQuery(hostData?._id, {
    skip: !hostData?._id
  });
  const hostTrips = tripsData?.data || [];



  if (!hostData?._id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography>Loading host data...</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography>Loading trips...</Typography>
      </Box>
    );
  }

  if (error || !hostTrips.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography>No trips available for this host.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <Box sx={{ maxWidth: "1250px", width: "100%", px: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          {hostTrips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {/* Image Section */}
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={trip.bannerImage || trip.cardImage || "https://images.pexels.com/photos/2387869/pexels-photo-2387869.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"}
                    alt={trip.title}
                    sx={{
                      filter: "brightness(0.85)",
                    }}
                  />

                  {/* Gradient Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60%",
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    }}
                  />

                  {/* Categories Tag */}
                  {trip.categories && trip.categories.length > 0 && (
                    <Chip
                      label={extractArrayData(trip.categories[0]) || "Category"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "#c4472c",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: 600,
                        boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                  )}

                  {/* Favorite Button */}
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 1)",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FavoriteBorderIcon
                      sx={{ color: "#FF0E07", fontSize: "18px" }}
                    />
                  </IconButton>

                  {/* Title and Location Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "16px",
                      left: "16px",
                      right: "16px",
                    }}
                  >
                    <Typography
                      // variant="h6"s
                      sx={{
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "18px",
                        lineHeight: "1.2",
                        mb: "4px",
                        textAlign: "left",
                      
                        textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      {trip.title}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <LocationOnIcon
                        sx={{
                          color: "#FFFFFF",
                          fontSize: "16px",
                          filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))",
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
                        {trip.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Content Section */}
                <CardContent sx={{ flexGrow: 1, p: 2, px: { xs: 0, md: 2 } }}>
                  {/* Trip Details */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px 100px",
                      mb: "16px",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <CalendarTodayIcon
                        sx={{ color: "#666", fontSize: "16px" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#666", fontSize: "13px" }}
                      >
                        {extractDate(trip.selectDate)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <AccessTimeIcon
                        sx={{ color: "#666", fontSize: "16px" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#666", fontSize: "13px" }}
                      >
                        {trip.days}D/{trip.nights}N
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <GroupIcon sx={{ color: "#666", fontSize: "16px" }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "#666", fontSize: "13px" }}
                      >
                        {extractSeats(trip.numberOfSeats)} seats
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <StarIcon sx={{ color: "#FFD700", fontSize: "16px" }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "#666", fontSize: "13px" }}
                      >
                        {getCleanRating(trip.ratings)} ({trip?.reviews?.length || 0})
                      </Typography>
                    </Box>
                  </Box>

                  {/* Pricing */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      mb: "16px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#c4472c",
                        fontSize: "20px",
                        fontWeight: 700,
                      }}
                    >
                      ₹{trip.price || trip.firstBookingPrice || "N/A"}
                    </Typography>
                    {trip.strikePrice && (
                      <Typography
                        sx={{
                          color: "#9CA3AF",
                          fontSize: "14px",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹{trip.strikePrice}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        color: "#9CA3AF",
                        fontSize: "12px",
                      }}
                    >
                      / person
                    </Typography>
                  </Box>

                  {/* Book Now Button */}
                  <Button
                    component={Link}
                    to={`/trips/${trip.seoSlug || trip._id}`}
                    variant="contained"
                    fullWidth
                    sx={{
                      background: "#c4472c",
                      color: "white",
                      borderRadius: "12px",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        background: "#a63a24",
                      },
                    }}
                  >
                    Book Now 
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

HostCards.propTypes = {
  hostData: PropTypes.shape({
    _id: PropTypes.string,
  }),
};

export default HostCards;
