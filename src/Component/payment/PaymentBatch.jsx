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
    color: "#111827",
    fontWeight: "bold",
    height: "30px",

    "&:hover": {
      color: "#CD482A",
      opacity: 1,
    },
    "&.Mui-selected": {
      color: "#fff",
      background: "#CD482A",
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

export default function PaymentBatch({
  sortedMonthKeys,
  batchList,
  setCardData,
  endSelectDate,
  cardData,
}) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box
      sx={{
        width: "95%",
        mx: "auto",
        // ml: { xs: 0, sm: 1 },
      }}
    >
      <Box
        sx={{
          //   border: "1px solid #F3F4F6",
          //   background: "#F9FAFB",
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
              //   backgroundColor: "#CD482A",
            },
          }}
        >
          {sortedMonthKeys?.map((monthName, index) => (
            <AntTab key={index} label={monthName} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      <Box
        // className="scroolbox"
        sx={{
          // height: "500px",
          // overflowY: "scroll",

          my: 2,
          py: { xs: 1, md: 1 },
          // px: { xs: 1, md: 2 },
          border: { xs: "none", sm: "1px solid #F3F4F6" },
          background: "#FBFBFB",
        }}
      >
        {sortedMonthKeys?.map((monthName, index) => (
          <TabPanel key={index} value={value} index={index}>
            {/* Pass the batch data for the current month */}
            <January
              selectDate={batchList[monthName]}
              endSelectDate={endSelectDate}
              setCardData={setCardData}
              cardData={cardData}
            />
          </TabPanel>
        ))}
        {/* <TabPanel value={value} index={0}>
          <January />
        </TabPanel> */}
      </Box>
    </Box>
  );
}
