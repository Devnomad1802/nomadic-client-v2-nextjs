"use client";

import { Container, Typography, Box } from "@mui/material";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { email } from "../Images";

const Emailvarification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location?.state?.email;

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
    }
  }, [navigate, userEmail]);
  return (
    <Box>
      <Container maxWidth="xs">
        <Typography align="center" variant="h3" mt={6}>
          Check your email
        </Typography>
        <Typography variant="body2" mt={2}>
          {`We sent an email to 
          ${userEmail}
          Open the email to verify your email addrress`}
        </Typography>
        <Box align="center">
          <img
            src={email}
            alt="email verification"
            srcSet=""
            style={{ maxWidth: "200px", width: "100%" }}
          />
        </Box>
        <Typography mt={2} align="center">
          Click the link in your email to continue
        </Typography>
        <Typography variant="body2" mt={2} sx={{ textAlign: "center" }}>
          Didn`t receive the email?
          <Typography
            component="span"
            sx={{ color: "#D09B03", cursor: "pointer" }}
          >
            {" "}
            Resed Email
          </Typography>
        </Typography>
      </Container>
    </Box>
  );
};

export default Emailvarification;
