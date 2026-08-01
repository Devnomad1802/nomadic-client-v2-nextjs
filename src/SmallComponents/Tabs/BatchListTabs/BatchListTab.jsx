"use client";

/* eslint-disable react/prop-types */
import * as React from "react";
import PropTypes from "prop-types";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import January from "./January";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
const AntTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    minWidth: 0,
    [theme.breakpoints.up("sm")]: {
      minWidth: 0,
    },
    paddingLeft: theme.spacing(2),
    paddingRightt: theme.spacing(0),
    paddingTop: "0px",
    paddingBottom: "0px",
    marginLeft: "20px",
    color: "#221C17",
    fontWeight: "bold",
    height: "30px",

    "&:hover": {
      color: "#CF4A2C",
      opacity: 1,
    },
    "&.Mui-selected": {
      color: "#fff",
      background: "#CF4A2C",
      borderRadius: "16px",

      opacity: 1,
    },

    "&.Mui-focusVisible": {
      backgroundColor: "#d1eaff",
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

export default function BatchListTab({
  selectDate,
  numberOfSeats,
  numberOfDays,
  endSelectDate,
}) {
  const [batchList, setBatchList] = React.useState({
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
  });

  React.useEffect(() => {
    const batchData = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    selectDate?.forEach((dateObj, index) => {
      const batchDate = new Date(dateObj.BatchDate);
      // Hide batches that start before today
      if (Number.isNaN(batchDate.getTime()) || batchDate < today) return;

      const monthName = batchDate?.toLocaleDateString(undefined, {
        month: "long",
      });
      if (!batchData[monthName]) {
        batchData[monthName] = [];
      }

      // Push batch details to the corresponding month array
      batchData[monthName]?.push({
        batchDate: dateObj.BatchDate,
        numberOfSeats: numberOfSeats[index]?.batchSeats,
        numberOfDays: numberOfDays[index]?.selectDays,
        endSelectDate: endSelectDate[index]?.EndBatchDate,
      });
    });

    // Update the state with the organized batch data
    setBatchList(batchData);
  }, [selectDate, numberOfSeats, numberOfDays, endSelectDate]);

  //
  const sortedMonthKeys = Object.keys(batchList).sort((a, b) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames.indexOf(a) - monthNames.indexOf(b);
  });

  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Typography
        sx={{
          fontSize: {
            xs: "18px",
            md: "23px",
          },
          fontWeight: "500",
          color: "#000",
          textAlign: { xs: "center", md: "left" },
          mb: 5
        }}
      >
        Batch List
      </Typography>


      <Box sx={{ width: "100%", mx: "auto", ml: { xs: 0, sm: 1 } }}>

        <Box
          sx={{
            //   border: "1px solid #F1EADD",
            //   background: "#FBF6EE",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}

        >

          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons
            sx={{
              [`& .${tabsClasses.scrollButtons}`]: {
                color: "#000",
                "&.Mui-disabled": { opacity: 0.3 },
              },
              "& .MuiTabs-indicator": {
                display: "none",
                //   mb: 1,
                //   backgroundColor: "#CF4A2C",
              },
            }}
          >
            {sortedMonthKeys?.map((monthName, index) => (
              <AntTab key={index} label={monthName} {...a11yProps(index)} />
            ))}
          </Tabs>
        </Box>
        <Box
          sx={{
            my: 2,
            py: { xs: 1, md: 1 },
            // px: { xs: 1, md: 2 },
            border: { xs: "none", sm: "1px solid #F1EADD" },
            background: "#FBFBFB",
          }}
        >
          {sortedMonthKeys?.map((monthName, index) => (
            <TabPanel key={index} value={value} index={index}>
              <January selectDate={batchList[monthName]} />
            </TabPanel>
          ))}
        </Box>
      </Box>
    </>
  );
}
