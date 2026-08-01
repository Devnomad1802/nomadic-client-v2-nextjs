"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const HostHeader = ({ hostData }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "500px", sm: "450px", md: "400px" },
        background: hostData?.coverImage
          ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("${hostData.coverImage}")`
          : 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: { xs: "16px", sm: "20px" },
          left: { xs: "16px", sm: "20px" },
          background: "rgba(255, 255, 255, 0.9)",
          "&:hover": {
            background: "rgba(255, 255, 255, 1)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Main Content Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          maxWidth: "1200px",
        }}
      >
        {/* Host Profile Card (Bottom-Left) */}
        <Box
          sx={{
            position: { xs: "relative", lg: "absolute" },
            bottom: { xs: "auto", lg: "32px" },
            left: { xs: "auto", lg: "-10px" },
            top: { xs: "50%", lg: "auto" },
            transform: { xs: "translateY(-50%)", lg: "none" },
            borderRadius: "16px",
            padding: { xs: "20px", sm: "24px", md: "28px" },
            maxWidth: { xs: "100%", lg: "800px" },
            width: { xs: "100%", lg: "auto" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: "20px", sm: "24px", md: "30px" },
              alignItems: { xs: "center", sm: "flex-start" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {/* Profile Picture */}
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={hostData?.brandingLogo || "https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"}
                sx={{
                  width: { xs: 100, sm: 110, md: 120 },
                  height: { xs: 100, sm: 110, md: 120 },
                  borderRadius: "12px",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                }}
              />
              {/* Online Status Shield */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: "-12px", sm: "-15px" },
                  right: { xs: "-12px", sm: "-15px" },
                  width: { xs: "35px", sm: "40px", md: "45px" },
                  height: { xs: "35px", sm: "40px", md: "45px" },
                  background: "#4CAF50",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SecurityIcon
                  sx={{
                    color: "white",
                    fontSize: { xs: "20px", sm: "22px", md: "25px" },
                  }}
                />
              </Box>
            </Box>

            {/* Host Info */}
            <Box sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "center", sm: "center" },
                  gap: { xs: "8px", sm: "12px" },
                  mb: "12px",
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 500,
                    fontSize: {
                      xs: "20px",
                      sm: "24px",
                      md: "28px",
                      lg: "32px",
                    },
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {hostData?.hostName || "Host Name"}
                </Typography>
                {hostData?.isVerified && (
                  <Chip
                    label="Verified Host"
                    size="small"
                    sx={{
                      background: "rgba(76, 175, 80, 0.3)",
                      color: "white",
                      fontSize: { xs: "10px", sm: "12px" },
                      fontWeight: 600,
                      height: { xs: "28px", sm: "32px" },
                      width: { xs: "100px", sm: "110px" },
                      backdropFilter: "blur(100px)",
                      border: "1px solid rgba(76, 175, 80, 0.5)",
                    }}
                  />
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  mb: "10px",
                  fontStyle: "italic",
                  textAlign: { xs: "center", sm: "left" },
                  fontWeight: 400,
                  fontSize: { xs: "12px", sm: "14px", md: "16px" },
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                &quot;{hostData?.tagline || "Creating amazing travel experiences"}&quot;
              </Typography>

              {/* Host Details in Flex Row */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: "12px", sm: "10px", md: "24px" },
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <LocationOnIcon
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: { xs: "16px", sm: "18px" },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: { xs: "10px", sm: "12px", md: "14px" },
                      fontFamily:
                        "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {hostData?.location || "Location not specified"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <CalendarTodayIcon
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: { xs: "16px", sm: "18px" },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: { xs: "10px", sm: "12px", md: "14px" },
                      fontFamily:
                        "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Since {hostData?.foundedYear || "2024"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <EmojiEventsIcon
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: { xs: "16px", sm: "18px" },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: { xs: "10px", sm: "12px", md: "14px" },
                      fontFamily:
                        "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {hostData?.experience || "Experienced Host"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Statistics Card (Top-Right) - Hidden on screens less than 1280px */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            position: "absolute",
            top: "130px",
            right: "0",
            borderRadius: "16px",
            padding: "24px",
            minWidth: "450px",
            backdropFilter: "blur(100px)",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "60px",
              justifyContent: "space-around",
            }}
          >
            {/* Rating */}
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{ display: "flex", justifyContent: "center", mb: "8px" }}
              >
                {[1, 2, 3, 4].map((star) => (
                  <StarIcon
                    key={star}
                    sx={{ color: "#FFD700", fontSize: "20px" }}
                  />
                ))}
                <StarIcon
                  sx={{ color: "rgba(255, 255, 255, 0.3)", fontSize: "20px" }}
                />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  mb: "4px",
                  fontSize: "32px",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                4.9
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Rating
              </Typography>
            </Box>

            {/* Trips Hosted */}
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{ display: "flex", justifyContent: "center", mb: "8px" }}
              >
                <TrendingUpIcon sx={{ color: "#FF6B35", fontSize: "20px" }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  mb: "4px",
                  fontSize: "32px",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {hostData?.tripsHosted || "0"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Trips Hosted
              </Typography>
            </Box>

            {/* Success Rate */}
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{ display: "flex", justifyContent: "center", mb: "8px" }}
              >
                <SecurityIcon sx={{ color: "#4CAF50", fontSize: "20px" }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  mb: "4px",
                  fontSize: "32px",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {hostData?.successRate || "0"}%
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Success Rate
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons (Bottom-Right) */}
      <Box
        sx={{
          position: { xs: "relative", lg: "absolute" },
          bottom: { xs: "auto", sm: "-160px", md: "-140px", lg: "50px" },
          right: {
            xs: "auto",
            sm: "10px",
            md: "10px",
            lg: "160px",
            xl: "160px",
          },
          mt: { xs: 3, lg: 0 },
          display: "flex",
          gap: { xs: "8px", sm: "12px" },
          flexDirection: { xs: "column", sm: "row" },
          width: { xs: "100%", sm: "700px", md: "700px" },
          justifyContent: { xs: "center", sm: "flex-end" },
        }}
      >
        <Button
          variant="outlined"
          sx={{
            background: "rgba(255, 255, 255, 0.3)",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            borderRadius: "16px",
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: "10px", sm: "12px", md: "14px" },
            fontWeight: 600,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.4)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          Write a Review
        </Button>
        <Button
          variant="contained"
          sx={{
            background: "#C8462A",
            borderRadius: "16px",
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: "10px", sm: "12px", md: "14px" },
            color: "white",
            fontWeight: 600,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            "&:hover": {
              background: "#a63a24",
            },
          }}
          onClick={() => window.open(`mailto:${hostData?.emailAddress}`, '_blank')}
        >
          Contact Host
        </Button>
      </Box>
    </Box>
  );
};

export default HostHeader;
