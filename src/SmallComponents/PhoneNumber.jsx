"use client";

/* eslint-disable react/prop-types */
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Box } from "@mui/material";
import { useState } from "react";

const PhoneNumber = ({ setRegisterData, registerData, defaultPhone }) => {
  const [value, setValue] = useState();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <PhoneInput
        country={"in"}
        value={(() => { const raw = registerData?.phone || defaultPhone || ""; const digits = String(raw).replace(/\D/g, ""); return digits.length === 10 ? `91${digits}` : digits; })()}
        onChange={(phone) => {
          if (typeof setRegisterData === "function") {
            setRegisterData({ ...registerData, phone }); // Update the phone property in registerData
          } else {
            console.error("setRegisterData is not a function");
          }
          setValue(phone); // Optionally update local state if needed
        }}
        inputProps={{
          required: true,
        }}
      />
    </Box>
  );
};

export default PhoneNumber;
