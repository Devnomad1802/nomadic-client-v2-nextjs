"use client";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NatureIcon from "@mui/icons-material/Nature";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Avatar,
  Box,
  Card,
  CardMedia,
  Chip,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";

const AboutUs = ({ hostData }) => {
  const [galleryTab, setGalleryTab] = useState(0);

  const handleGalleryTabChange = (event, newValue) => {
    setGalleryTab(newValue);
  };

  const specialties = hostData?.specialties?.map(specialty => ({ 
    label: specialty, 
    active: true 
  })) || [];

  const achievements = hostData?.achievements?.map(achievement => ({
    icon: <EmojiEventsIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
    text: achievement,
  })) || [
    {
      icon: <PersonIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
      text: "Experienced Host",
    },
    {
      icon: <EmojiEventsIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
      text: `${hostData?.tripsHosted || 0}+ Trips Hosted`,
    },
    {
      icon: <SecurityIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
      text: `${hostData?.successRate || 0}% Success Rate`,
    },
    {
      icon: <NatureIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
      text: "Verified Host",
    },
  ];

  const galleryImages = hostData?.gallery || [
    "https://images.pexels.com/photos/2387869/pexels-photo-2387869.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    "https://images.pexels.com/photos/2387870/pexels-photo-2387870.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    "https://images.pexels.com/photos/2387871/pexels-photo-2387871.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
  ];

  const galleryVideos = [
    {
      id: "video1",
      title: "Himalayan Trek Experience",
      thumbnail:
        "https://images.pexels.com/photos/2387869/pexels-photo-2387869.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: "video2",
      title: "Mountain Climbing Adventure",
      thumbnail:
        "https://images.pexels.com/photos/2387870/pexels-photo-2387870.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: "video3",
      title: "Camping in the Wilderness",
      thumbnail:
        "https://images.pexels.com/photos/2387871/pexels-photo-2387871.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ];

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
          px: { xs: 2, md: 4 },
        }}
      >
        <Grid container spacing={4}>
          {/* Main Content - Left Side */}
          <Grid item xs={12} lg={8}>
            {/* About Mountain Explorers Section */}
            <Box
              sx={{
                mb: 4,
                background: "white",
                borderRadius: "16px",
                padding: { xs: "20px", sm: "24px", md: "28px" },
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 500,
                  color: "#27272A",
                  mb: 3,
                  fontSize: { xs: "24px", sm: "28px", md: "32px" },
                  textAlign: "left",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                About {hostData?.hostName || "Host"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#52525B",
                  lineHeight: 1.8,
                  mb: 3,
                  fontSize: { xs: "14px", sm: "16px" },
                  textAlign: "left",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {hostData?.hostOverview || `Welcome to ${hostData?.hostName || "our host"}'s profile. We specialize in creating amazing travel experiences and have been serving travelers for ${hostData?.foundedYear ? new Date().getFullYear() - parseInt(hostData.foundedYear) : "several"} years. Our team is dedicated to providing safe, memorable, and transformative travel experiences.`}
              </Typography>

              {/* Specialties */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: "#27272A",
                    mb: 2,
                    fontSize: { xs: "18px", sm: "20px" },
                    textAlign: "left",
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Our Specialties
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: 1, sm: 1.5 },
                  }}
                >
                  {specialties.map((specialty, index) => (
                    <Chip
                      key={index}
                      label={specialty.label}
                      sx={{
                        background: "#F9ECE9",
                        color: "#CF4A2C",
                        fontWeight: 500,
                        fontSize: { xs: "12px", sm: "14px" },
                        height: { xs: "32px", sm: "36px" },
                        border: "1px solidrgb(226, 120, 97)",
                        fontFamily:
                          "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                        "&:hover": {
                          background: "#F9ECE9",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Gallery Section */}
            <Box
              sx={{
                background: "white",
                borderRadius: "16px",
                padding: { xs: "20px", sm: "24px", md: "28px" },
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 400,
                  color: "#27272A",
                  mb: 3,
                  fontSize: { xs: "24px", sm: "28px", md: "32px" },
                  textAlign: "left",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Gallery
              </Typography>

              {/* Gallery Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                  value={galleryTab}
                  onChange={handleGalleryTabChange}
                  sx={{
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#CF4A2C",
                      height: "3px",
                    },
                  }}
                >
                  <Tab
                    label={`Photos (${galleryImages.length})`}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: { xs: "14px", sm: "16px" },
                      color: "#52525B",
                      "&.Mui-selected": {
                        color: "#CF4A2C",
                      },
                    }}
                  />
                  <Tab
                    label="Videos (3)"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: { xs: "14px", sm: "16px" },
                      color: "#52525B",
                      "&.Mui-selected": {
                        color: "#CF4A2C",
                      },
                    }}
                  />
                </Tabs>
              </Box>

              {/* Gallery Grid */}
              <Grid container spacing={2}>
                {galleryTab === 0
                  ? // Photos Tab
                    galleryImages.map((image, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Card
                          sx={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.12)",
                            },
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="140"
                            image={image}
                            alt={`Gallery image ${index + 1}`}
                            sx={{
                              objectFit: "cover",
                            }}
                          />
                        </Card>
                      </Grid>
                    ))
                  : // Videos Tab
                    galleryVideos.map((video) => (
                      <Grid item xs={12} sm={6} md={4} key={video.id}>
                        <Card
                          sx={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.12)",
                            },
                          }}
                        >
                          <Box sx={{ position: "relative" }}>
                            <CardMedia
                              component="img"
                              height="140"
                              image={video.thumbnail}
                              alt={video.title}
                              sx={{
                                objectFit: "cover",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "50px",
                                height: "50px",
                                background: "rgba(0, 0, 0, 0.7)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 0,
                                  height: 0,
                                  borderTop: "8px solid transparent",
                                  borderBottom: "8px solid transparent",
                                  borderLeft: "12px solid white",
                                  marginLeft: "2px",
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ p: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "#27272A",
                                fontSize: "14px",
                                fontFamily:
                                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                              }}
                            >
                              {video.title}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
              </Grid>
            </Box>
          </Grid>

          {/* Achievements Sidebar - Right Side */}
          <Grid item xs={12} lg={4}>
            <Box
              sx={{
                background: "white",
                borderRadius: "16px",
                padding: { xs: "20px", sm: "24px" },
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                height: "fit-content",
                top: "20px",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  color: "#27272A",
                  mb: 3,
                  fontSize: { xs: "20px", sm: "22px" },
                  textAlign: "left",
                }}
              >
                Achievements
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {achievements.map((achievement, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      textAlign: "left",
                      gap: 2,
                      padding: "6px",
                      borderRadius: "8px",
                      transition: "background 0.3s ease",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: "32px", sm: "36px" },
                        height: { xs: "32px", sm: "36px" },
                        background: "rgba(196, 71, 44, 0.1)",
                      }}
                    >
                      {achievement.icon}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#27272A",
                        fontWeight: 400,
                        fontSize: { xs: "13px", sm: "14px" },
                        flex: 1,
                      }}
                    >
                      {achievement.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AboutUs;
