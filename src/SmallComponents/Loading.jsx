"use client";

import { Backdrop } from "@mui/material";
import { BeatLoader } from "react-spinners";

const Loading = ({ isLoading }) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 100000,
      }}
      open={isLoading}
    >
      <BeatLoader color="#CF4A2C" />
    </Backdrop>
  );
};

export default Loading;
