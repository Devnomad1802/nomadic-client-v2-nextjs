"use client";

import { Box, Typography, Select, MenuItem, FormControl } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useState } from "react";

const HostFilter = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 3,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
          px: 4,
          py: 3,
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon sx={{ color: "#6B6355", fontSize: "20px" }} />
          <Typography variant="body1" sx={{ color: "#6B6355", fontWeight: 500 }}>
            Filter Trips:
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C8462A",
                borderWidth: "1px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C8462A",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C8462A",
              },
              "& .MuiSelect-select": {
                color: "#6B6355",
                fontWeight: 500,
              },
              "& .MuiPaper-root": {
                borderRadius: "12px",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #CBC2B3",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: "12px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #CBC2B3",
                  "& .MuiMenuItem-root": {
                    color: "#6B6355",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#EFEAE1",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#EFEAE1",
                      "&:hover": {
                        backgroundColor: "#EFEAE1",
                      },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem
              value=""
              sx={{
                color: "#6B6355",
                fontWeight: 500,
                backgroundColor: "#EFEAE1",
              }}
            >
              All Months
            </MenuItem>
            <MenuItem value="january">January</MenuItem>
            <MenuItem value="february">February</MenuItem>
            <MenuItem value="march">March</MenuItem>
            <MenuItem value="april">April</MenuItem>
            <MenuItem value="may">May</MenuItem>
            <MenuItem value="june">June</MenuItem>
            <MenuItem value="july">July</MenuItem>
            <MenuItem value="august">August</MenuItem>
            <MenuItem value="september">September</MenuItem>
            <MenuItem value="october">October</MenuItem>
            <MenuItem value="november">November</MenuItem>
            <MenuItem value="december">December</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#CBC2B3",
                borderWidth: "1px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C8462A",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C8462A",
              },
              "& .MuiSelect-select": {
                color: "#6B6355",
                fontWeight: 500,
              },
              "& .MuiPaper-root": {
                borderRadius: "12px",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #CBC2B3",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: "12px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #CBC2B3",
                  "& .MuiMenuItem-root": {
                    color: "#6B6355",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#EFEAE1",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#EFEAE1",
                      "&:hover": {
                        backgroundColor: "#EFEAE1",
                      },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem
              value=""
              sx={{
                color: "#6B6355",
                fontWeight: 500,
                backgroundColor: "#EFEAE1",
              }}
            >
              All Locations
            </MenuItem>
            <MenuItem value="manali">Manali</MenuItem>
            <MenuItem value="ladakh">Ladakh</MenuItem>
            <MenuItem value="himachal">Himachal Pradesh</MenuItem>
            <MenuItem value="uttarakhand">Uttarakhand</MenuItem>
            <MenuItem value="sikkim">Sikkim</MenuItem>
            <MenuItem value="kashmir">Kashmir</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default HostFilter;
