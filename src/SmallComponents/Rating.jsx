"use client";

/* eslint-disable react/prop-types */
import * as React from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { extractRating } from "../utils";

export default function BasicRating({ ratings }) {
  const [value, setValue] = React.useState(extractRating(ratings));

  return (
    <Box
      sx={{
        "& > legend": { mt: 2 },
      }}
    >
      <Rating name="read-only" value={value} readOnly size="small" />
    </Box>
  );
}
