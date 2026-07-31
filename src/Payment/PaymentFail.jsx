"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { pf1, ps1 } from "../Images";

const Paymentfail = () => {
  return (
    <Container>
      <Box
        sx={{
          width: "100%",

          backgroundImage: `url(${ps1})`,
          height: "400px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          borderRadius: "17px",
          backgroundColor: "#EEF5FB",
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              mb: 1,
            }}
          >
            <img src={pf1} alt="" srcSet="" style={{ width: "50px" }} />
          </Box>
          <Typography
            sx={{ color: "#111827", fontSize: "28px", fontWeight: "600" }}
          >
            Oops!
          </Typography>
          <Typography sx={{ color: "#6D7280", mt: 1 }}>
            There was an error while booking the trip.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          my: 3,
          gap: "0px 20px",
        }}
      >
        <Button
          sx={{
            color: "#EC3F18",
            border: "1px solid #EC3F18",
            borderRadius: "20px",
            width: "100px",
          }}
        >
          Cencel
        </Button>
        <Button
          sx={{
            color: "#fff",
            background: "#EC3F18",
            borderRadius: "20px",
            width: "100px",
          }}
        >
          Try Again
        </Button>
      </Box>
    </Container>
  );
};

export default Paymentfail;
