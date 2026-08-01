"use client";

/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

import { motion } from "framer-motion";
import { allpkgbg } from "../../Images";
import EnquirNow from "../../Modals/EnquirNow";
import { CustomField } from "../../SmallComponents/CustomInput";
import { baseImage } from "../../utils";

const AllPakgaeshome = ({ allpkgbg, onSearch, initialSearch = "" }) => {
  const [search, SetSearch] = useState(initialSearch);
  const handleChange = (e) => {
    SetSearch(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 10, md: 0 } }}>
      <Box
        sx={{
          position: "relative",
          height: { xs: "320px", sm: " 361px" },
          width: "100%",
          backgroundImage: {
            xs: `url(${allpkgbg})`,
          },
          backgroundPosition: { xs: "center", md: "center" },
          backgroundRepeat: "no-repeat",
          backgroundSize: { xs: "cover", sm: "cover" },
          boxSizing: "border-box",
          borderRadius: { xs: "15px", md: "30px" },
          mt: { xs: 10, md: 0 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 2 }}
        >
          <Container maxWidth="md" sx={{}}>
            <Box
              sx={{
                mx: "auto",
                width: { xs: "80%", md: "655px" },
                pt: { xs: "165px", sm: "185px" },
                pb: 5,
                display: "flex",
                flexDirection: "column",
                gap: { xs: "20px 0px", sm: "30px 0px" },
                // background: "#F4F4F5",
              }}
            >
              <Typography
                variant="heading1"
                sx={{
                  color: "#fff",
                  fontSize: { xs: "33px", sm: "40px", md: "48px" },
                }}
              >
                All Experiences
              </Typography>{" "}
              <CustomField
                name="search"
                placeholder="Search your favorite destination"
                value={search}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </Box>
          </Container>
        </motion.div>
      </Box>
    </Container>
  );
};

export default AllPakgaeshome;
