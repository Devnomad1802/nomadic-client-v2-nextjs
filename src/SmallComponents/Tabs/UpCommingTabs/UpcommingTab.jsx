"use client";

import * as React from "react";
import PropTypes from "prop-types";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import January from "./January";
import { Button } from "@mui/material";
import { TripCardSkeleton } from "../../Skeletons";
import { useGetTripsQuery } from "../../../services/TripApis";
import { useState } from "react";
import { useEffect } from "react";

const AntTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    minWidth: 70, // Ensure sufficient width for centering
    [theme.breakpoints.up("sm")]: {
      minWidth: 70,
    },
    // paddingRight: theme.spacing(0),
    paddingTop: 0,
    paddingBottom: 0,
    margin: "0px 10px",
    color: "#221C17",
    fontWeight: "500 !important",
    height: "20px",
    display: "flex", // Flex display to center text
    alignItems: "center", // Vertical centering
    justifyContent: "center", // Horizontal centering
    textAlign: "center",
    mx: "auto",
    border: "1px solid #E6DDCF",
    borderRadius: "32px",
    "& .MuiTab-wrapper": {
      height: "20px",
      border: "1px solid #E6DDCF",
      borderRadius: "32px",
    },
    "&:hover": {
      color: "#CF4A2C",
      opacity: 1,
      border: "1px solid #E6DDCF",
      borderRadius: "32px",
    },
    "&.Mui-selected": {
      color: "#fff",
      background: "#CF4A2C",

      opacity: 1,
      textAlign: "center",
      mx: "auto",
      display: "flex", // Flex display to center text
      alignItems: "center", // Vertical centering
      justifyContent: "center", // Horizontal centering
      borderRadius: "32px",
    },
    "&.Mui-focusVisible": {
      backgroundColor: "#d1eaff",
      border: "1px solid #E6DDCF",
      borderRadius: "32px",
    },
  })
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function UpcomingTab({ searchQuery = "" }) {
  const { isError, isFetching, isLoading, data } = useGetTripsQuery();
  const [monthTrips, setMonthTrips] = useState();
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    if (data) {
      const parsedData = data.data.map((trip) => ({
        ...trip,
        selectDate: trip.selectDate ? JSON.parse(trip.selectDate) : [],
        ratings: Array.isArray(trip.ratings) ? trip.ratings : (trip.ratings ? JSON.parse(trip.ratings) : []),
      }));

      const monthTripsObj = {
        All: [], // Create "All" entry for all trips
        January: [],
        February: [],
        March: [],
        April: [],
        May: [],
        June: [],
        July: [],
        August: [],
        September: [],
        October: [],
        November: [],
        December: [],
      };

      parsedData.forEach((trip) => {
        const batches = Array.isArray(trip.selectDate) ? trip.selectDate : [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let addedToAll = false;
        batches.forEach((b) => {
          if (!b || !b.BatchDate) return;
          const date = new Date(b.BatchDate);
          if (isNaN(date) || date < now) return;
          const month = date.toLocaleString("default", { month: "long" });
          if (monthTripsObj[month]) monthTripsObj[month].push(trip);
          if (!addedToAll) {
            monthTripsObj["All"].push(trip);
            addedToAll = true;
          }
        });
      });

      const sortedMonths = Object.keys(monthTripsObj).sort((a, b) =>
        a === "All" ? -1 : new Date(a + " 1, 2000") - new Date(b + " 1, 2000")
      );

      const sortedMonthTripsObj = {};
      sortedMonths.forEach((month) => {
        sortedMonthTripsObj[month] = monthTripsObj[month];
      });

      setMonthTrips(sortedMonthTripsObj);
    }
  }, [data]);

  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", mx: "auto", ml: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "md",
          mx: "auto",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="scrollable"
          scrollButtons
          sx={{
            mx: "auto",
            [`& .${tabsClasses.scrollButtons}`]: {
              color: "#000",
              fontWeight:"500 !important",
              "&.Mui-disabled": { opacity: 0.3 },
            },
            "& .MuiTabs-indicator": {
              display: "none",
              height: "20px",
            },
          }}
        >
          {monthTrips &&
            Object.keys(monthTrips)
              .filter((month) => {
                if (month === "All") return true;
                const m = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
                return m[month] >= new Date().getMonth();
              })
              .map((month, index) => (
                <AntTab
                  key={index}
                  label={month}
                  {...a11yProps(index)}
                  // sx={{
                  //   textAlign: "center",
                  //   display: "flex",
                  //   alignItems: "center",
                  //   justifyContent: "center",
                  // }}
                />
              ))}
        </Tabs>
      </Box>
      <Box
        sx={{
          my: { xs: 2, md: 0 },
          py: { xs: 1, md: 1 },
          px: { xs: 1, md: 2 },
          ml: { xs: -2, md: 0 },
        }}
      >
        {isLoading ? (
          <Box sx={{ px: { xs: 0, md: 2 }, py: 2 }}>
            <TripCardSkeleton count={6} />
          </Box>
        ) : (
          <>
            {monthTrips &&
              Object.keys(monthTrips)
                .filter((month) => {
                  if (month === "All") return true;
                  const m = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
                  return m[month] >= new Date().getMonth();
                })
                .map((month, index) => (
                  <TabPanel key={index} value={value} index={index}>
                    {value === index && (
                      <January
                        activeMonth={monthTrips[month]}
                        viewAll={viewAll}
                        setViewAll={setViewAll}
                        searchQuery={searchQuery}
                      />
                    )}
                  </TabPanel>
                ))}
          </>
        )}
      </Box>
      <Button
        onClick={() => {
          setViewAll(!viewAll);
        }}
        variant="simplebtn"
        sx={{
          mt: { xs: -3, sm: 0 },
          width: "199px",
          border: "1.5px solid #E9622F",
          background: "transparent",
          color: "#E9622F",
          "&:hover": {
            border: "1.5px solid #fff",
            background: "#3C3228",
          },
        }}
      >
        {!viewAll ? "View All" : "View Less"}
      </Button>
    </Box>
  );
}
