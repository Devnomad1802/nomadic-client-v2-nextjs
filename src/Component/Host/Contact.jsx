"use client";

import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Box, Card, Chip, Grid, Typography } from "@mui/material";

const Contact = ({ hostData }) => {
  const contactInfo = [
    {
      icon: <EmailIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
      label: "Email",
      value: hostData?.emailAddress || "No email provided",
      color: "#CF4A2C",
    },
    {
      icon: <PhoneIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
      label: "Phone",
      value: hostData?.phoneNumber || "No phone provided",
      color: "#CF4A2C",
    },
    {
      icon: <LocationOnIcon sx={{ color: "#CF4A2C", fontSize: "20px" }} />,
      label: "Location",
      value: hostData?.location || "Location not specified",
      color: "#CF4A2C",
    },
  ];

  const socialLinks = [
    {
      icon: <LanguageIcon sx={{ color: "#3C3228", fontSize: "20px" }} />,
      label: "Website",
      url: hostData?.socialMedia?.website,
    },
    {
      icon: <FacebookIcon sx={{ color: "#3C3228", fontSize: "20px" }} />,
      label: "Facebook",
      url: hostData?.socialMedia?.facebook,
    },
    {
      icon: <InstagramIcon sx={{ color: "#3C3228", fontSize: "20px" }} />,
      label: "Instagram",
      url: hostData?.socialMedia?.instagram,
    },
    {
      icon: <TwitterIcon sx={{ color: "#3C3228", fontSize: "20px" }} />,
      label: "Twitter",
      url: hostData?.socialMedia?.twitter,
    },
  ].filter(social => social.url); // Only show social links that have URLs

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
          {/* Get in Touch Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: "16px",
                padding: { xs: "24px", sm: "32px" },
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                background: "white",
                height: "100%",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 500,
                  color: "#3C3228",
                  mb: 4,
                  fontSize: { xs: "24px", sm: "28px" },
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  textAlign: "left",
                }}
              >
                Get in Touch
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {contactInfo.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: "#F9ECE9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e27861",
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#3C3228",
                          fontSize: "14px",
                          fontFamily:
                            "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                          mb: 0.5,
                          textAlign: "left",
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: item.color,
                          fontSize: { xs: "14px", sm: "16px" },
                          fontFamily:
                            "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                          textAlign: "left",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* Follow Us Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: "16px",
                padding: { xs: "24px", sm: "32px" },
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                background: "white",
                height: "100%",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 500,
                  color: "#3C3228",
                  mb: 4,
                  fontSize: { xs: "24px", sm: "28px" },
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  textAlign: "left",
                }}
              >
                Follow Us
              </Typography>

              <Grid container spacing={2}>
                {socialLinks.map((social, index) => (
                  <Grid item xs={6} key={index}>
                    <Chip
                      icon={social.icon}
                      label={social.label}
                      onClick={() => social.url && window.open(social.url, '_blank')}
                      sx={{
                        width: "100%",
                        height: "48px",
                        background: "#F1EADD",
                        border: "1px solid #D8CFC0",
                        borderRadius: "12px",
                        textAlign: "left",
                        fontFamily:
                          "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#3C3228",
                        cursor: social.url ? "pointer" : "default",
                        "&:hover": {
                          background: social.url ? "#CF4A2C" : "#F1EADD",
                          color: social.url ? "white" : "#3C3228",
                        },
                        "& .MuiChip-icon": {
                          color: "#3C3228",
                        },
                        "&:hover .MuiChip-icon": {
                          color: social.url ? "white" : "#3C3228",
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Contact;
