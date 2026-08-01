"use client";

import * as React from "react";
import PropTypes from "prop-types";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import styled from "@emotion/styled";
import { useMediaQuery } from "@mui/material";
import { t1 } from "../../../Images";
import MyAccount from "./MyAccount";
import TravelHistory from "./TravelHistory";
import Savedtrips from "./Savedtrips";
import Logout from "./Logout";
import Setting from "./Setting";
import MarketingCoupon from "./MarketingCoupon";
import { useSelector } from "react-redux";

const AntTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    minWidth: 0,
    fontSize: "14px",
    [theme.breakpoints.up("sm")]: {
      minWidth: 0,
      fontSize: "19px",
    },
    margin: "5px 5px",
    color: "#000",
    // width: "100%",
    borderRadius: "0px",
    fontWeight: "400",
    border: "2px solid #F1EADD",

    textAlign: "left",
    "& .MuiTab-wrapper": {
      justifyContent: "flex-start",
    },

    // fontFamily: "Inter",
    "&:hover": {
      color: "#fff",
      background: "#393938",
    },
    "&.Mui-selected": {
      color: "#fff",
      background: "#393938",
      opacity: 1,
    },
    "&.Mui-focusVisible": {
      background: "#393938",
    },
  })
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
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
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function ProfileTabs() {
  const matches = useMediaQuery("(min-width:900px)");
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Get User
  const { userDbData } = useSelector((store) => store.global);

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#FBF6EE",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "auto",
        color: "#000",
        my: { xs: 10, md: 5 },
        p: { xs: 0, md: 2 },
        borderRadius: "16px",
      }}
    >
      <Box
        sx={{
          border: "2px solid #F1EADD",
          py: 2,
          px: { xs: 1.5, md: 0 },
          maxHeight: "500px",
          borderRadius: "16px",
        }}
      >
        <Box>
          <img
            src={t1}
            alt=""
            srcSet=""
            style={{ width: "50px", borderRadius: "50%" }}
          />
        </Box>
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "20px", md: "28px" },
            mb: 5,
          }}
        >
          {userDbData?.name}
        </Typography>
        {userDbData?.influencer === "Yes" ? (
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            orientation={!matches ? "horizontal" : "vertical"}
            variant="scrollable"
            sx={{
              maxWidth: { xs: "100%", md: "300px" },
              minWidth: { xs: "100%", md: "300px" },
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              [`& .${tabsClasses.scrollButtons}`]: {
                color: "#000",
                "&.Mui-disabled": { opacity: 0.3 },
              },

              "& .MuiTabs-indicator": {
                display: "none",
                // backgroundColor: "#EF6119",
                // width: "3px", // Change this to your desired color
              },
            }}
          >
            <AntTab
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
              }}
              label="My Account"
              {...a11yProps(0)}
            />
            <AntTab
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
              }}
              label="Marketing Coupon"
              {...a11yProps(1)}
            />
            <AntTab
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
              }}
              label="My Trips"
              {...a11yProps(2)}
            />
            <AntTab
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
              }}
              label="Saved Trips"
              {...a11yProps(3)}
            />
            <AntTab
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
              }}
              label="Settings"
              {...a11yProps(4)}
            />
            <AntTab
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
              }}
              label="Logout"
              {...a11yProps(5)}
            />
          </Tabs>
        ) : (
          <>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs example"
              orientation={!matches ? "horizontal" : "vertical"}
              variant="scrollable"
              sx={{
                maxWidth: { xs: "100%", md: "300px" },
                minWidth: { xs: "100%", md: "300px" },
                display: "flex",
                justifyContent: "flex-start",
                [`& .${tabsClasses.scrollButtons}`]: {
                  color: "#000",
                  "&.Mui-disabled": { opacity: 0.3 },
                },

                "& .MuiTabs-indicator": {
                  display: "none",
                  // backgroundColor: "#EF6119",
                  // width: "3px", // Change this to your desired color
                },
              }}
            >
              <AntTab
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "flex-start",
                }}
                label="My Account"
                {...a11yProps(0)}
              />
              <AntTab
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "flex-start",
                }}
                label="My Trips"
                {...a11yProps(1)}
              />
              <AntTab
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "flex-start",
                }}
                label="Saved Trips"
                {...a11yProps(2)}
              />
              <AntTab
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "flex-start",
                }}
                label="Settings"
                {...a11yProps(3)}
              />
              <AntTab
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "flex-start",
                }}
                label="Logout"
                {...a11yProps(3)}
              />
            </Tabs>
          </>
        )}
      </Box>

      {userDbData?.influencer === "Yes" ? (
        <>
          <Box
            sx={{
              border: "2px solid #F1EADD",
              background: "#FBF6EE",
              borderRadius: "16px",
              p: { xs: 0, md: 2 },
              ml: { xs: 0, md: 2 },
              mt: { xs: 5, md: 0 },
              width: "100%",
            }}
          >
            <TabPanel value={value} index={0}>
              <MyAccount />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <MarketingCoupon />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <TravelHistory />
            </TabPanel>

            <TabPanel value={value} index={3}>
              <Savedtrips />
            </TabPanel>

            <TabPanel value={value} index={4}>
              <Setting />
            </TabPanel>
            <TabPanel value={value} index={5}>
              <Logout />
            </TabPanel>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              border: "2px solid #F1EADD",
              background: "#FBF6EE",
              borderRadius: "16px",
              p: { xs: 0, md: 2 },
              ml: { xs: 0, md: 2 },
              mt: { xs: 5, md: 0 },
              width: "100%",
            }}
          >
            <TabPanel value={value} index={0}>
              <MyAccount />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <TravelHistory />
            </TabPanel>

            <TabPanel value={value} index={2}>
              <Savedtrips />
            </TabPanel>

            <TabPanel value={value} index={3}>
              <Setting />
            </TabPanel>
            <TabPanel value={value} index={4}>
              <Logout />
            </TabPanel>
          </Box>
        </>
      )}
    </Box>
  );
}
