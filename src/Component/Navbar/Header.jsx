"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box"; // Hidden replaced with Box sx
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import MenuIcon from "@mui/icons-material/Menu";
import clsx from "clsx";
import { Button, IconButton, Paper } from "@mui/material";
import { logo3, logof } from "../../Images";

import { Link, NavLink, useNavigate } from "react-router-dom";
import SignUpModal from "../../Modals/SignUpModal";
import EnquirNow from "../../Modals/EnquirNow";

const array1 = [
  {
    name: "Home",
    link1: "/",
  },
  {
    name: "All Experiences",
    link1: "/experiences",
  },
  {
    name: "About Us",
    link1: "/about-us",
  },

  {
    name: "Blog",
    link1: "/blog",
  },
  {
    name: "Contact Us",
    link1: "/contact-us",
  },
];

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
    alignItems: "center",
  },
  paper: {
    background: "#09121D",
    justifyContent: "flex-start",
  },
  hover: {
    "&:hover": {
      color: "#fff",
    },
  },
});

// eslint-disable-next-line react/prop-types
export default function Header({ children }) {
  // sign Up modal
  const [opens, setOpens] = useState(false);
  const toggelModel = () => {
    setOpens(!opens);
  };

  // Enqur Modal
  const [opene, setOpene] = useState(false);
  const toggelModele = () => {
    setOpene(!opene);
  };

  const navigate = useNavigate();
  const classes = useStyles();
  const [state, setState] = React.useState({ left: false });
  const [colorChange, setColorchange] = useState(false);

  const styledactivelink = ({ isActive }) => {
    return {
      textDecoration: "none",
      padding: "10px",
      borderRadius: "5px",
      fontSize: "15px",
      color: isActive ? "#000" : "#fff ",
      fontFamily: "Inter",
      display: "flex",
      gap: "20px",
      alignItems: "center",
      background: isActive ? "#fff" : "",
    };
  };

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };
  useEffect(() => {
    const changeNavbarColor = () => {
      if (window.scrollY > 10) {
        // Check if scroll value is greater than 100vh
        setColorchange(true);
      } else {
        setColorchange(false);
      }
    };

    window.addEventListener("scroll", changeNavbarColor);

    return () => {
      window.removeEventListener("scroll", changeNavbarColor);
    };
  }, []);

  const list = (anchor) => (
    <Box
      className={clsx(classes.list, {
        [classes.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      {children}

      <Box
        onClick={() => {
          navigate("/");
        }}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px 0px",
          width: "150px",
          height: "70px",
          mx: "auto",
          mt: "40px",
        }}
      >
        <img
          src={logof}
          alt=""
          srcSet=""
          style={{
            height: "100%",
            width: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
      <List
        sx={{ mt: 1, px: 2 }}
        onClose={toggleDrawer(anchor, false)}
        onOpen={toggleDrawer(anchor, true)}
      >
        {array1.map(({ link1, name }, index) => {
          return (
            <Box key={index}>
              <NavLink to={link1} style={styledactivelink}>
                {name}
              </NavLink>
            </Box>
          );
        })}
        <Box
          sx={{
            mt: 5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "20px 0px",
          }}
        >
          <Button
            variant="simplebtn"
            sx={{}}
            onClick={() => {
              setOpene(true);
            }}
          >
            Enquire Now
          </Button>
          <Button
            onClick={() => setOpens(true)}
            variant="simplebtn"
            sx={{ with: "150px" }}
          >
            Sign Up
          </Button>
        </Box>
      </List>
    </Box>
  );
  return (
    <Box>
      <SignUpModal
        opens={opens}
        setOpens={setOpens}
        toggelModel={toggelModel}
      />
      <EnquirNow
        opene={opene}
        setOpene={setOpene}
        toggelModele={toggelModele}
      />
      <Box
        sx={{
          background: "transparent",
          position: "fixed",
          backgroundColor: colorChange ? "#000" : "#000",
          zIndex: 10,
          width: "100%",
        }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            ml: 1,
          }}
        >
          <Link to="/">
            <img
              src={logof}
              alt=""
              srcSet=""
              style={{
                height: "40px",
                marginLeft: "5px",
                width: "100px",
                objectFit: "contain",
              }}
            />
          </Link>
        </Box>
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box sx={{ display: { xs: "block", lg: "none" } }}>
              {["left"].map((anchor) => (
                <React.Fragment key={anchor}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      borderRadius: "5px",
                      boxShadow: 2,
                      p: 1,
                    }}
                  >
                    <IconButton onClick={toggleDrawer(anchor, true)}>
                      <MenuIcon
                        sx={{
                          fontSize: "25px",
                          cursor: "pointer",
                          boxShadow: 0,

                          color: "#fff",
                        }}
                      />
                    </IconButton>
                  </Box>
                  <Paper>
                    <SwipeableDrawer
                      classes={{ paper: classes.paper }}
                      anchor={anchor}
                      open={state[anchor]}
                      onClose={toggleDrawer(anchor, false)}
                      onOpen={toggleDrawer(anchor, true)}
                    >
                      <Box
                        sx={{
                          height: "100vh",
                          width: "100%",
                          background: "#09121D",
                        }}
                      >
                        {list(anchor)}
                      </Box>
                    </SwipeableDrawer>
                  </Paper>
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
