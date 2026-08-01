"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useDispatch } from "react-redux";
import { setUserDbData } from "../../../slices";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const LogOut = () => {
    dispatch(setUserDbData(null));
    navigate("/");
  };
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        // border: "2px solid red",
        mx: "auto",
      }}
    >
      <Box
        sx={{
          maxWidth: "sm",
          boxShadow: "0px 0px 17px -3px rgba(0,0,0,0.75)",
          height: { xs: "170px", md: "200px" },
          borderRadius: { xs: "20px", md: "32px" },
          mt: { xs: "10px", md: "100px" },
          mx: "auto",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            color: "#000",
            fontFamily: "Inter",
            fontSize: { xs: "19px", sm: "22px", md: "28px" },
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "140%",
            p: 2,
          }}
        >
          Are you sure you want to logout?
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "0px 30px",
            mt: { xs: 2, md: 4 },
          }}
        >
          <Button
            onClick={() => navigate("/")}
            sx={{
              border: "2px solid #CF4A2C",
              borderRadius: "20px",
              color: "#CF4A2C",
              px: { xs: 3, sm: 3, md: 6 },
              "&:hover": {
                background: "#CF4A2C",
                color: "#fff",
              },
            }}
          >
            Cancal
          </Button>
          <Button
            onClick={LogOut}
            sx={{
              border: "2px solid #CF4A2C",
              borderRadius: "20px",
              color: "#fff",
              px: { xs: 3, sm: 3, md: 6 },
              background: "#CF4A2C",
              "&:hover": {
                background: "#fff",
                color: "#CF4A2C",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
