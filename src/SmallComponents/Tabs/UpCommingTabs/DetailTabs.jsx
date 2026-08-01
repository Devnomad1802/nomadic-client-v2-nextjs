"use client";

import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Overview from "./Overview";
import Itinerary from "./Itinerary";
import BatchListTab from "../BatchListTabs/BatchListTab";
import Gallary from "./Gallary";
import InclusionExclusion from "./InclusionExclusion";
import OtherInfo from "./OtherInfo";
import { tabsClasses } from "@mui/material/Tabs";
import TabReview from "./TabReview";

const AntTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    minWidth: 0,
    [theme.breakpoints.up("sm")]: {
      minWidth: 0,
    },
    paddingLeft: theme.spacing(0),
    paddingRightt: theme.spacing(0),
    marginLeft: "57px",
    color: "#1E1C18",
    fontWeight: "bold",

    "&:hover": {
      color: "#C8462A",
      opacity: 1,
    },
    "&.Mui-selected": {
      color: "#C8462A",
      //   background: "linear-gradient(90.1deg, #4F98D0 0.11%, #34D9B1 95.94%)",
      borderRadius: "5px",

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

export default function DetailTabs() {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", mx: "auto", ml: 1 }}>
      <Box
        sx={{
          border: "1px solid #EFEAE1",
          background: "#EFEAE1",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Tabs
          variant="scrollable"
          scrollButtons
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{
            [`& .${tabsClasses.scrollButtons}`]: {
              color: "#000",
              "&.Mui-disabled": { opacity: 0.3 },
            },
            "& .MuiTabs-indicator": {
              //   display: "none",
              mb: 1,
              backgroundColor: "#C8462A",
            },
          }}
        >
          <AntTab label="Overview" {...a11yProps(0)} />
          {/* <AntTab label="Itinerary" {...a11yProps(1)} /> */}
          <AntTab label="Batch List" {...a11yProps(1)} />
          <AntTab label="Inclusion & Exclusion" {...a11yProps(2)} />
          <AntTab label="Other Info" {...a11yProps(3)} />
          <AntTab label="Gallery" {...a11yProps(4)} />
          <AntTab label=" Review" {...a11yProps(5)} />
          <AntTab label="FAQ" {...a11yProps(6)} />
        </Tabs>
      </Box>
      <Box
        // className="scroolbox"
        sx={{
          // height: "500px",
          // overflowY: "scroll",

          my: 2,
          py: { xs: 1, md: 1 },
          px: { xs: 1, md: 2 },
          border: "1px solid #EFEAE1",
          background: "#EFEAE1",
        }}
      >
        <TabPanel value={value} index={0}>
          <Overview />
          <Itinerary />
        </TabPanel>
        {/* <TabPanel value={value} index={1}></TabPanel> */}
        <TabPanel value={value} index={1}>
          <Box maxWidth="md">
            <Typography
              sx={{
                color: "#000",
                fontSize: { xs: "16px", md: "23px" },
                my: 2,
                textAlign: "left",
              }}
            >
              Batch List
            </Typography>

            <BatchListTab />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <InclusionExclusion />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <OtherInfo />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Gallary />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <TabReview />
        </TabPanel>
        <TabPanel value={value} index={6}>
          <Typography sx={{ my: 5, fontSize: "30px", color: "#000" }}>
            FAQ
          </Typography>
          {/* <BlogTabReview /> */}
        </TabPanel>
      </Box>
    </Box>
  );
}
