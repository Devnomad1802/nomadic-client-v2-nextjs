"use client";

import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { inputStyle } from "../../../PageComponents/ContactUs";
import PhoneNumber from "../../PhoneNumber";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useSelector } from "react-redux";

const currencies = [
  {
    value: "Male",
    label: "Male",
  },
  {
    value: "Female",
    label: "Female",
  },
];

const MyAccount = () => {
  const { userDbData } = useSelector((store) => store.global);

  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
  });


  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // const handleUpdateUser = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setLoading(true);
  //     const formDataToSend = new FormData();
  //     formDataToSend.append("firstName", registerData?.firstName);

  //     const res = await editUser(formDataToSend).unwrap();

  //     dispatch(setUserDbData(res?.data));
  //     UpdateZohoContact(res?.data);
  //     getUser();
  //     showToast(`${res?.message}`, "success");

  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //   }
  // };

  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: "20px", md: "28px" },
          color: "#000",
          textAlign: "left",
        }}
      >
        My Account
      </Typography>
      <form>
        <Grid
          container
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px 10px",
            mt: 5,
          }}
        >
          <Grid item xs={12} md={5.8}>
            <Box>
              <Typography sx={{ color: "#737373", textAlign: "left", mb: 1 }}>
                Name
              </Typography>
              <TextField
                sx={inputStyle}
                name="name"
                size="small"
                placeholder="Jhon Smith"
                defaultValue={userDbData?.name}
                onChange={handleChange}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5.8}>
            <Box>
              <Typography sx={{ color: "#737373", textAlign: "left", mb: 1 }}>
                Email
              </Typography>
              <TextField
                sx={inputStyle}
                size="small"
                name="email"
                placeholder="Jhone@gmail.com"
                defaultValue={userDbData?.email}
                onChange={handleChange}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5.8}>
            <Box>
              <Typography sx={{ color: "#737373", textAlign: "left", mb: 1 }}>
                Mobile
              </Typography>
              <PhoneNumber
                handleChange={handleChange}
                setRegisterData={setRegisterData}
                registerData={registerData}
                defaultPhone={`${userDbData?.phone}`}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5.8}>
            <Box>
              <Typography sx={{ color: "#737373", textAlign: "left", mb: 1 }}>
                Gender
              </Typography>
              <TextField
                sx={inputStyle}
                id="outlined-select-currency"
                select
                defaultValue="Male"
                size="small"
                name="gender"
                helperText="Please select your currency"
                onChange={handleChange}
              >
                {currencies.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    defaultValue={userDbData?.gender}
                    sx={{ width: "100%", textAlign: "left", color: "#000" }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>
        </Grid>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
          }}
        >
          <Button
            // sx={{
            //   background: "#EC3F18",
            //   borderRadius: "30px",
            //   color: "#fff",
            //   px: 5,
            //   py: 1,
            //   mt: 5,
            // }}
            variant="simplebtn"
            sx={{ background: "#CD482A", color: "#fff" }}
          >
            Update
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default MyAccount;
