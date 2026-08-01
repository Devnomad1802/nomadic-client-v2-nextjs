"use client";

import { Container, Typography, Box, TextField, Button } from "@mui/material";
import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useResetPassMutation } from "../services/authApis";
import Loading from "../SmallComponents/Loading";
import Toastify from "../SmallComponents/Tostify";
import { inputStyle } from "../PageComponents/ContactUs";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });
  const [email, setEmail] = useState("");
  const [resetPass] = useResetPassMutation();

  const handleForgotPassword = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        setLoading(true);
        const data = await resetPass(email).unwrap();

        setAlertState({
          open: true,
          message: data?.message,
          severity: "success",
        });

        setLoading(false);
        navigate("/email-verification", {
          state: { email },
        });
      } catch (error) {
        setLoading(false);
        setAlertState({
          open: true,
          message: error?.data?.message,
          severity: "error",
        });
      }
    },
    [email, navigate, resetPass]
  );

  return (
    <>
      <Loading isLoading={loading} />
      <Toastify setAlertState={setAlertState} alertState={alertState} />
      <Container maxWidth="sm">
        <Typography
          align="center"
          variant="h3"
          mt={6}
          sx={{ color: "#4E483D" }}
        >
          Forget your password?
        </Typography>
        <Typography mt={2} sx={{ color: "#4E483D" }}>
          Reset your password with a device you`ve recently used to access
          Nomadic Townies to avoid a temporary security restriction.
        </Typography>
        <Box sx={{ maxWidth: "350px", mx: "auto", mt: 3 }}>
          <Typography mt={2} sx={{ color: "#4E483D", textAlign: "left" }}>
            Email
          </Typography>
          <TextField
            required
            sx={inputStyle}
            type="email"
            name="email"
            size="small"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>

        <Button
          sx={{
            my: 3,
            textTransform: "capitalize",
            minWidth: "140.6px",
            fontSize: "14px",
            borderRadius: "32px",
            fontFamily: "Inter",
            maxWidth: "350px",
            px: 2,
            width: "100%",
            background: "#33302A",
            color: "#fff",
            border: "1.5px solid #33302A",

            "&:hover": {
              background: "#EFEAE1",
              color: "#C8462A",
              //   height: "45px",
              border: "1.5px solid #C8462A",
            },
          }}
          onClick={handleForgotPassword}
        >
          Reset Password
        </Button>
      </Container>
    </>
  );
};

export default ForgetPassword;
