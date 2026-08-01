"use client";

import { Badge, Box, Tab, Tabs } from "@mui/material";

const HostTabs = ({ activeTab, onTabChange, hostData }) => {
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        background: "white",
        display: "flex",
        justifyContent: "center",
        py: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => onTabChange(e, newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#CF4A2C",
              height: "2px",
            },
          }}
        >
          <Tab
            label={
              <Badge
                badgeContent={hostData?.tripsHosted || 0}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#CF4A2C",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 500,
                    minWidth: "16px",
                    height: "16px",
                    position: "static",
                    transform: "none",
                    marginLeft: "8px",
                  },
                }}
              >
                Upcoming Trips
              </Badge>
            }
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              color: "#666",
              "&.Mui-selected": {
                color: "#CF4A2C",
              },
            }}
          />
          <Tab
            label="About Us"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              color: "#666",
              "&.Mui-selected": {
                color: "#CF4A2C",
              },
            }}
          />
          <Tab
            label={
              <Badge
                badgeContent={hostData?.successRate ? `${hostData.successRate}+` : "0+"}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#f5f5f5",
                    color: "#666",
                    fontSize: "10px",
                    fontWeight: 500,
                    minWidth: "24px",
                    height: "16px",
                    borderRadius: "10px",
                    padding: "0 6px",
                    position: "static",
                    transform: "none",
                    marginLeft: "8px",
                  },
                }}
              >
                Reviews
              </Badge>
            }
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              color: "#666",
              "&.Mui-selected": {
                color: "#CF4A2C",
              },
            }}
          />
          <Tab
            label="Contact"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              color: "#666",
              "&.Mui-selected": {
                color: "#CF4A2C",
              },
            }}
          />
        </Tabs>
      </Box>
    </Box>
  );
};

export default HostTabs;
