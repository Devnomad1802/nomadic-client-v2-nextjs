"use client";

import { useState, useCallback } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserDbData } from "../slices";
import Loading from "../SmallComponents/Loading";
import Toastify from "../SmallComponents/Tostify";
import { inputStyle } from "./ContactUs";
import { baseUrl } from "../utils/api";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.global.userDbData);

  // Determine what the user still needs to provide
  const needsPhone = !user?.phone;
  const needsEmail = !user?.email;

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({ open: false, message: "", severity: undefined });
  const showToast = (msg, type) => setAlertState({ open: true, message: msg, severity: type });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    // `phone` holds an E.164 value (e.g. +919812345678). Store digits incl.
    // country code (the OTP flow prepends "+" server-side).
    const cleanPhone = (phone || "").replace(/\D/g, "");

    if (!cleanName) return showToast("Full Name is compulsory", "error");
    if (needsPhone && !isValidPhoneNumber(phone || "")) return showToast("Please enter a valid phone number with its country code", "error");
    if (needsEmail && !email.trim()) return showToast("Email address is compulsory", "error");

    const body = {
      userId: user?._id,
      name: cleanName,
      ...(needsPhone ? { phone: cleanPhone } : {}),
      ...(needsEmail ? { email: email.trim() } : {}),
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(baseUrl + "/auth/editUser", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        dispatch(setUserDbData({
          ...user,
          name: cleanName,
          ...(needsPhone ? { phone: cleanPhone } : {}),
          ...(needsEmail ? { email: email.trim() } : {}),
        }));
        showToast("Profile completed successfully!", "success");
        setTimeout(() => navigate("/"), 1000);
      } else {
        showToast(data.msg || "Update failed", "error");
      }
      setLoading(false);
    } catch (err) {
      console.error("[CompleteProfile] error:", err);
      showToast("Something went wrong", "error");
      setLoading(false);
    }
  }, [name, phone, email, needsPhone, needsEmail, user, dispatch, navigate]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9" }}>
      <Loading isLoading={loading} />
      <Toastify setAlertState={setAlertState} alertState={alertState} />
      <Container maxWidth="sm">
        <Box sx={{ background: "#fff", borderRadius: "24px", p: { xs: 3, md: 5 }, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#3C3228", mb: 1 }}>
            Complete Your Profile
          </Typography>
          <Typography sx={{ fontSize: "15px", color: "#726A5E", mb: 4 }}>
            Please fill in your name and mobile number to complete your account setup.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px 0px" }}>
              <Box>
                <Typography sx={{ color: "#3C3228", fontWeight: 600, fontSize: "14px", textAlign: "left", mb: 1 }}>
                  Full Name <span style={{ color: "#EF4444" }}>*</span>
                </Typography>
                <TextField
                  required
                  sx={inputStyle}
                  size="small"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Box>

              {needsPhone ? (
                <Box>
                  <style>{`
                    .nt-phone-input { display:flex; gap:8px; align-items:stretch; }
                    /* Country selector looks like a clickable dropdown: bordered
                       box with flag + a visible chevron. */
                    .nt-phone-input .PhoneInputCountry {
                      position:relative; display:flex; align-items:center; gap:7px;
                      height:40px; padding:0 10px; border:1px solid #D8CFC0;
                      border-radius:8px; background:#fff; cursor:pointer;
                    }
                    .nt-phone-input .PhoneInputCountry:hover { border-color:#CF4A2C; }
                    .nt-phone-input .PhoneInputCountryIcon { width:26px; height:18px; box-shadow:0 0 0 1px rgba(0,0,0,.08); }
                    /* native select overlays the box so the whole thing is clickable */
                    .nt-phone-input .PhoneInputCountrySelect { position:absolute; inset:0; opacity:0; cursor:pointer; }
                    .nt-phone-input .PhoneInputCountrySelectArrow {
                      display:inline-block; width:7px; height:7px; margin-left:2px;
                      border-style:solid; border-color:#8A8073; border-width:0 2px 2px 0;
                      transform:rotate(45deg); opacity:1;
                    }
                    .nt-phone-input .PhoneInputInput {
                      flex:1; height:40px; border:1px solid #D8CFC0; border-radius:8px;
                      padding:0 12px; font-size:15px; color:#221C17; outline:none; background:#fff;
                    }
                    .nt-phone-input .PhoneInputInput:focus { border-color:#CF4A2C; box-shadow:0 0 0 3px rgba(207,74,44,.12); }
                  `}</style>
                  <Typography sx={{ color: "#3C3228", fontWeight: 600, fontSize: "14px", textAlign: "left", mb: 1 }}>
                    Phone Number <span style={{ color: "#EF4444" }}>*</span>
                  </Typography>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={setPhone}
                    className="nt-phone-input"
                  />
                  <Typography sx={{ color: "#8A8073", fontSize: "12px", textAlign: "left", mt: 0.5 }}>
                    Tap the flag ▾ to change country. We check the number is valid for the selected country.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography sx={{ color: "#737373", textAlign: "left", mb: 1 }}>Phone Number</Typography>
                  <TextField sx={inputStyle} size="small" value={user?.phone || ""} disabled />
                </Box>
              )}

              {user?.email && (
                <Box>
                  <Typography sx={{ color: "#737373", textAlign: "left", mb: 1 }}>Email Address</Typography>
                  <TextField sx={inputStyle} size="small" value={user?.email || ""} disabled />
                </Box>
              )}

              {needsEmail && (
                <Box>
                  <Typography sx={{ color: "#3C3228", fontWeight: 600, fontSize: "14px", textAlign: "left", mb: 1 }}>
                    Email Address <span style={{ color: "#EF4444" }}>*</span>
                  </Typography>
                  <TextField
                    required
                    type="email"
                    sx={inputStyle}
                    size="small"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Box>
              )}
            </Box>
            <Button
              type="submit"
              variant="simplebtn"
              sx={{
                width: "100%",
                background: "#E9622F",
                color: "#fff",
                mt: 3.5,
                py: 1.5,
                fontSize: "16px",
                fontWeight: 700,
                borderRadius: "12px",
                "&:hover": { background: "#D13412" },
              }}
            >
              Complete Setup &amp; Continue →
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default CompleteProfile;
