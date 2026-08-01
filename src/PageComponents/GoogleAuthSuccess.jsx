"use client";

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDbData } from "../slices";
import { Box, CircularProgress, Typography } from "@mui/material";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("token", token);
        dispatch(setUserDbData(user));
        // Google provides name + email but no phone — send first-time
        // users to complete their profile if anything is missing.
        const profileIncomplete = !user?.name || !user?.phone || !user?.email;
        setTimeout(
          () => navigate(profileIncomplete ? "/complete-profile" : "/"),
          1500
        );
      } catch (err) {
        console.error("Google auth error:", err);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", gap: 2,
    }}>
      <CircularProgress sx={{ color: "#C8462A" }} />
      <Typography sx={{ color: "#4E483D", fontSize: "18px" }}>
        Logging you in...
      </Typography>
    </Box>
  );
};

export default GoogleAuthSuccess;
