"use client";

import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logo3 } from "../../Images";
import Categories from "./Categories";

const About = ({ aboutSection }) => {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Box
      sx={{
        position: "relative",
        py: { xs: 6, md: 10 },
        mt: { xs: 4, md: 8 },
        width: "100%",
        backgroundImage: `url(${aboutSection})`,
        backgroundPosition: { xs: "center", md: "left" },
        backgroundRepeat: "no-repeat",
        backgroundSize: { xs: "100% 100%", sm: "cover" },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "start", sm: "start" },
          
          justifyContent: "flex-start",
          pt: { xs: 10, md: 15 }
        }}
      >
        <motion.div
          // initial={{ opacity: 0, y: 150 }}
          // whileInView={{ opacity: 1, y: 0 }}
          // exit={{ opacity: 0, y: 150 }}
          // transition={{ duration: 2 }}
        >
          <Grid
            container
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              width: "100%"
            }}
          >
            <Grid
              item
              xs={12}
              md={9}
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <Box>
                <Typography sx={{ textAlign: { xs: "center", md: "left" }, fontFamily: "Playfair", fontSize: { xs: "22px", md: "28px", lg: "40px" } }}>
                  About Us
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    textAlign: { xs: "center", md: "left" },
                    fontSize: { xs: "20px", md: "28px" , lg:"32px"},
                    pb:2
                  }}
                >
           Hey Explorer, Welcome to Nomadic Townies !!
                </Typography>
                <Typography sx={{ textAlign: { xs: "center", md: "left" }, fontSize: { xs: "16px", md: "18px" , lg:"18px"}, fontFamily: "Inter", fontWeight: 400, lineHeight: "140%" ,width:{xs:"100%", md:"80%", lg:"55%"}}}>
                Ever wondered how it all began?
Let’s rewind to 2020. Amid dreams and wanderlust,
a group of passionate friends came together with one mission
to make travel more meaningful, mindful, and accessible for everyone.











                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Button
                    onClick={() => navigate("/about-us")}
                    sx={{
                      background: "#E9622F",
                      mt: 5,
                      px: 2.5,
                      py: 1.3,
                      borderRadius: "30px",
                      minWidth: "170px",
                      color: "#fff",
                      "&:hover": {
                        background: "#3C3228",
                      },
                    }}
                  >
                    More About Us
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  mt:{xs:0, md:-5, lg:-10},
                  height: { xs: "100px", sm: "100px", md: "150px" , lg:"350px"},
                  width: { xs: "100px", sm: "100px", md: "150px" , lg:"350px"},
                }}
              >
                <img
                  src={logo3}
                  alt=""
                  srcSet=""
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            ></Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default About;
