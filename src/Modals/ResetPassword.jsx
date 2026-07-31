"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Container,
  Typography,
  InputAdornment,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useChangePassMutation } from "../services/authApis";
import Loading from "../SmallComponents/Loading";
import Toastify from "../SmallComponents/Tostify";
import { inputStyle } from "../PageComponents/ContactUs";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState();
  const [changePass] = useChangePassMutation();
  const [confirmPassword, setConfirmPassword] = useState();
  const [resetPassParam, setResetPassParam] = useSearchParams();
  const [loading, setLoading] = React.useState(false);


  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });
  // eslint-disable-next-line operator-linebreak
  const resetPassUserId =
    new URLSearchParams(resetPassParam).get("token") || false;

  useEffect(() => {
    if (!resetPassUserId) {
      navigate("/");
    }
  }, [navigate, resetPassUserId]);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword((show) => !show);
  };

  const showToast = (msg, type) => {
    return setAlertState({
      open: true,
      message: msg,
      severity: type,
    });
  };

  const handleResetPassword = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        if (password !== confirmPassword) {
          return showToast("Password Did Not Match", "error");
        }

        setLoading(true);
        const data = await changePass({
          token: resetPassUserId,
          password,
        }).unwrap();

        setLoading(false);
        showToast(data?.message, "success");
        resetPassParam.delete("resetToken");
        setResetPassParam(resetPassParam);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (error) {
        showToast(error?.data?.message, "error");
        setLoading(false);
      }
    },
    [
      changePass,
      confirmPassword,
      navigate,
      password,
      resetPassParam,
      resetPassUserId,
      setResetPassParam,
    ]
  );
  return (
    <>
      <Loading isLoading={loading} />

      <Toastify setAlertState={setAlertState} alertState={alertState} />

      <Container maxWidth="xs">
        <Typography
          align="center"
          variant="h3"
          mt={6}
          sx={{ color: "#4B5563" }}
        >
          Reset Password
        </Typography>
        <Typography mt={2} sx={{ color: "#4B5563", textAlign: "left" }}>
          Choose a password
        </Typography>

        <TextField
          required
          sx={inputStyle}
          size="small"
          placeholder="#inclu%89Kl.@59"
          type={showPassword ? "text" : "password"}
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  sx={{ color: "#393938" }}
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? (
                    <Visibility sx={{ color: "#393938" }} />
                  ) : (
                    <VisibilityOff sx={{ color: "#393938" }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography mt={2} sx={{ color: "#4B5563", textAlign: "left" }}>
          Confirm password
        </Typography>
        <TextField
          required
          sx={inputStyle}
          size="small"
          placeholder="#inclu%89Kl.@59"
          type={showConfirmPassword ? "text" : "password"}
          name="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  sx={{ color: "#393938" }}
                  aria-label="toggle password visibility"
                  onClick={handleClickShowConfirmPassword}
                >
                  {showPassword ? (
                    <Visibility sx={{ color: "#393938" }} />
                  ) : (
                    <VisibilityOff sx={{ color: "#393938" }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {/* <TextField
          style={inputStyle}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="........"
          type={showConfirmPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowConfirmPassword}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        /> */}

        <Button
          onClick={handleResetPassword}
          sx={{
            my: 5,
            textTransform: "capitalize",
            minWidth: "140.6px",
            fontSize: "14px",
            borderRadius: "32px",
            fontFamily: "Inter",
            px: 2,
            width: "100%",
            background: "#393938",
            color: "#fff",
            border: "1.5px solid #393938",

            "&:hover": {
              background: "#FBFBFB",
              color: "#CD482A",
              //   height: "45px",
              border: "1.5px solid #CD482A",
            },
          }}
        >
          update password
        </Button>
      </Container>
    </>
  );
};

export default ResetPassword;
