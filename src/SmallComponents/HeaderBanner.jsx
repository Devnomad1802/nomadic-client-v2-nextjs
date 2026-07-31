"use client";

/* eslint-disable react/prop-types */
import { Box, Container, Typography } from "@mui/material";
import { blogsbg } from "../Images";
import { baseUrl } from "../utils";

const HeaderBanner = ({ img, text }) => {
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 10, md: 0 } }}>
      <Box
        sx={{
          width: "100%",
          height: { xs: "130px", sm: "260px", md: "360px" },
          borderRadius: { xs: "10px", md: "30px" },
          position: "relative",
          mt: { xs: "100px", lg: "0px" },
        }}
      >
        <Typography
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontSize: { xs: "20px", sm: "30", md: "48px" },
            //   border: "2px solid red",
          }}
        >
          {text}
        </Typography>
        <img
          src={`${img}`}
          alt={text ? `${text} - Nomadic Townies` : "Nomadic Townies travel page banner"}
          fetchpriority="high"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "30px",
            objectFit: "cover",
          }}
        />
      </Box>
    </Container>
  );
};

export default HeaderBanner;
