"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Box, Button, Container, Typography } from "@mui/material";
import AuthCode from "react-auth-code-input";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useVerifySmsCodeMutation } from "../services/authApis";
import { setUserDbData } from "../slices";
import Loading from "./Loading";
import Toastify from "./Tostify";

const codeNotValid = {
  open: true,
  message: "Code is wrong",
  severity: "error",
};

const TwoStepCode = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });
  const [result, setResult] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const number = location?.state?.number;

  const [verifyCode] = useVerifySmsCodeMutation();
  const handleOnChange = (res) => {
    setResult(res);
  };
  useEffect(() => {
    if (!number) {
      navigate("/");
    }
  }, [navigate, number]);

  const handleVerifySmsCode = useCallback(async () => {
    setLoading(true);
    try {
      if (result.length < 6) {
        setAlertState(codeNotValid);
        setLoading(false);
      } else {
        const response = await verifyCode({ number, result });

        if (response?.error || response?.data?.status !== "approved") {
          setAlertState(codeNotValid);
          setLoading(false);
        } else {
          dispatch(setUserDbData(response?.data?.data));
          setLoading(false);
          navigate("/dashboard/home");
        }
      }
    } catch (err) {
      setLoading(false);
    }
  }, [dispatch, navigate, number, result, verifyCode]);

  return (
    <Box py="50px">
      <Loading isLoading={loading} />
      <Toastify setAlertState={setAlertState} alertState={alertState} />
      <Box textAlign="center">
        <Typography variant="h2" sx={{ mt: "20px", color: "#3F3F46" }}>
          Set up two-step verification
        </Typography>
      </Box>
      <Container maxWidth="xs">
        <Box py="20px">
          <Typography align="left" mt={2} sx={{ color: "#3F3F46" }}>
            Enter Code
          </Typography>
          <AuthCode
            allowedCharacters="numeric"
            onChange={handleOnChange}
            inputClassName="input"
            containerClassName="container"
            length={6}
          />

          <Box sx={{ mt: "40px", color: "#3F3F46" }}>
            <Typography variant="gery">
              Security is critical at Nomadic Townies. To help keep your account
              safe, we&#39;ll text you a verification code when you sign in on a
              new device.
            </Typography>
          </Box>

          <Button
            variant="simplebtn"
            onClick={handleVerifySmsCode}
            fullWidth
            sx={{ py: 2, mt: 3 }}
          >
            Confirm Code
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default TwoStepCode;
