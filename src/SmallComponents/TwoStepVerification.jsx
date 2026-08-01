"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import "./phoneStyle.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useSendSmsCodeMutation } from "../services/authApis";
import Loading from "./Loading";
import Toastify from "./Tostify";

const phoneNotValid = {
  open: true,
  message: "Phone Number Not Valid",
  severity: "error",
};

export const TwoStepVerification = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const navigate = useNavigate();
  const { userDbData } = useSelector((store) => store.global);
  const [number, setNumber] = useState();
  const [sendCode] = useSendSmsCodeMutation();
  const [loading, setLoading] = React.useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });

  useEffect(() => {
    if (!token || userDbData) {
      navigate("/");
    }
  }, [navigate, token, userDbData]);

  const handleSendCode = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        setLoading(true);
        await sendCode({ number }).unwrap();
        setLoading(false);
        navigate("/two-step-code", { state: { number } });
      } catch (i) {
        setAlertState(phoneNotValid);
        setLoading(false);
      }
    },
    [navigate, number, sendCode]
  );

  return (
    <>
      <Box py="50px">
        <Loading isLoading={loading} />
        <Box textAlign="center">
          {/* <img src={logo} alt="logo" /> */}
          <Typography variant="h2" sx={{ mt: "20px", color: "#5A5247" }}>
            Set up two-step verification
          </Typography>
        </Box>
        <Toastify setAlertState={setAlertState} alertState={alertState} />
        <form onSubmit={handleSendCode}>
          <Container maxWidth="xs">
            <Box py="20px">
              <Typography align="left" mt={2} sx={{ color: "#5A5247" }}>
                Phone Number
              </Typography>
              <PhoneInput
                country={"in"}
                required
                onChange={(e) => setNumber(e)}
                inputProps={{
                  required: true,
                }}
              />

              <Box sx={{ mt: "40px" }}>
                <Typography sx={{ color: "#5A5247" }}>
                  Security is critical at Coinbase. To help keep your account
                  safe, we&#39;ll text you a verification code when you sign in
                  on a new device.
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="simplebtn"
                fullWidth
                sx={{ py: 2, mt: 3 }}
              >
                Send Code
              </Button>
            </Box>
          </Container>
        </form>
      </Box>
    </>
  );
};
