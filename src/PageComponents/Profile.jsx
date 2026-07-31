"use client";

import { Box } from "@mui/material";
import { Helmet } from "react-helmet-async";
import UserProfile from "../Component/Profile/UserProfile";
import Footer from "../Component/Footer";

const Profile = () => {
  return (
    <Box>
      <Helmet>
        <title>My Profile | Nomadic Townies</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <UserProfile />
      <Footer />
    </Box>
  );
};

export default Profile;
