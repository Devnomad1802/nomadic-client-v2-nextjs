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
      <BeatLoader color="#CD482A" />
    </Backdrop>
  );
};

export default Loading;
