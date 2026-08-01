"use client";

import { Alert, Box, Grid, IconButton, Typography } from "@mui/material";
import SnowshoeingIcon from "@mui/icons-material/Snowshoeing";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const array = [
  {
    text: "Amount",
    value: "$1200",
  },
  {
    text: "Discount",
    value: "-0",
  },
  {
    text: "GST",
    value: "$50",
  },
  {
    text: "Amount to Pay",
    value: "$1250",
  },
];

const SelectNTravel = () => {
  return (
    <Box
      sx={{
        background: "#FAFAFA",
        borderRadius: "32px",
        border: "1px solid #F4F4F5",
        p: { xs: 1, md: 3 },
        ml: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "0px 10px",
          mb: 3,
        }}
      >
        <SnowshoeingIcon sx={{ color: "#000" }} />

        <Typography
          sx={{
            fontSize: "19px",
            color: "#3F3F46",
            fontWeight: 500,
            textAlign: "left",
            ml: 1,
          }}
        >
          Select Batch Date
        </Typography>
      </Box>
      <Box>
        <Typography
          sx={{ color: "#878787", textAlign: "left", fontWeight: "500", my: 1 }}
        >
          Add Travellers
        </Typography>
      </Box>
      <Box
        sx={{
          background: "#FAFAFA",
          borderRadius: "15px",
          border: "1px solid #F4F4F5",
          p: { xs: 1, md: 3 },
        }}
      >
        <Grid
          container
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Grid item xs={12} sm={8} sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%",
                gap: { xs: "10px 10px", md: "10px 20px" },
              }}
            >
              <Box
                sx={{
                  border: "1px solid #F4F4F5",
                  p: { xs: 1, md: 2 },
                  borderRadius: "32px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: { xs: "100%", md: "70%" },
                  //   border: "2px solid red",
                }}
              >
                <IconButton sx={{ color: "#000" }}>
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ color: "#3F3F46" }}>1</Typography>
                <IconButton sx={{ color: "#000" }}>
                  <AddIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  width: { xs: "100%", md: "20%" },
                  display: "flex",
                  justifyContent: { xs: "flex-end", sm: "flex-start" },

                  gap: "0px 10px",
                  alignItems: "center",
                }}
              >
                <IconButton>
                  <CloseIcon sx={{ color: "#D2D5DA" }} />
                </IconButton>
                <Typography sx={{ color: "#71717A", fontWeight: "600" }}>
                  $400
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-end" },
              width: "100%",
            }}
          >
            <Typography
              sx={{
                color: "#3F3F46",
                fontSize: "19px",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              $1200
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Typography
        sx={{ color: "#878787", textAlign: "left", fontWeight: "500", my: 1 }}
      >
        Amounts
      </Typography>
      <Box
        sx={{
          background: "#FAFAFA",
          border: "1px solid #F4F4F5",
          p: { xs: 1, md: 3 },
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          borderRadius: "15px",
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "50%", lg: "40%" } }}>
          {array.map(({ text, value }, index) => {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  my: 1,
                }}
              >
                <Typography sx={{ color: "#878787" }}>{text}</Typography>
                <Typography sx={{ color: "#3F3F46", fontWeight: 500 }}>
                  {value}
                </Typography>
              </Box>
            );
          })}
          <Box sx={{ height: "1px ", background: "#A58787", width: "100%" }} />
          <Typography
            sx={{
              color: "#CF4A2C",
              fontSize: "23px",
              fontWeight: "500",
              textAlign: "right",
              mt: 2,
            }}
          >
            $1250
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SelectNTravel;
