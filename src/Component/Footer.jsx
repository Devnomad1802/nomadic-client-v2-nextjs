"use client";

import {
  Box,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { logof } from "../Images";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";

const footerLinks = [
  { name: "All Experiences", link: "/experiences" },
  { name: "About Us", link: "/about-us" },
  { name: "Careers", link: "/careers" },
  { name: "Blog", link: "/blog" },
  { name: "Contact Us", link: "/contact-us" },
  { name: "Terms & Conditions", link: "/terms-and-conditions" },
  { name: "Cancellation & Refund", link: "/cancellation-and-refund" },
  { name: "Privacy Policy", link: "/privacy-policy" },
];

const Footer = () => {
  return (
    <Box sx={{ background: "#1A1A1A" }}>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 6 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          {/* Logo */}
          <Box sx={{ width: { xs: "180px", md: "220px" } }}>
            <img
              src={logof}
              alt="Nomadic Townies"
              style={{ width: "100%", objectFit: "contain" }}
            />
          </Box>

          {/* Links — single row wrapping */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: { xs: "8px 16px", md: "8px 28px" },
            }}
          >
            {footerLinks.map((item, i) => (
              <Link
                key={i}
                to={item.link}
                onClick={() => window.scrollTo(0, 0)}
                style={{
                  color: "#8A8073",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontFamily: "Inter",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#8A8073")}
              >
                {item.name}
              </Link>
            ))}
          </Box>

          {/* Divider */}
          <Box sx={{ height: "1px", background: "#3C3228", width: "100%" }} />

          {/* GST + Address */}
          <Box>
            <Typography
              sx={{
                color: "#726A5E",
                fontSize: "13px",
                fontFamily: "Inter",
              }}
            >
              Nanded City, Pune, Maharashtra, India
            </Typography>
          </Box>

          {/* Contact Row */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: { xs: 2, md: 4 },
            }}
          >
            <Box
              component="a"
              href="mailto:hello@nomadictownies.com"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#D8CFC0",
                textDecoration: "none",
                fontSize: "13px",
                fontFamily: "Inter",
                "&:hover": { color: "#fff" },
              }}
            >
              <EmailOutlinedIcon sx={{ fontSize: 16 }} />
              hello@nomadictownies.com
            </Box>
            <Box
              component="a"
              href="tel:+918623929751"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#D8CFC0",
                textDecoration: "none",
                fontSize: "13px",
                fontFamily: "Inter",
                "&:hover": { color: "#fff" },
              }}
            >
              <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
              8623929751
            </Box>
            <Box
              component="a"
              href="https://www.nomadictownies.com"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#D8CFC0",
                textDecoration: "none",
                fontSize: "13px",
                fontFamily: "Inter",
                "&:hover": { color: "#fff" },
              }}
            >
              <LanguageOutlinedIcon sx={{ fontSize: 16 }} />
              www.nomadictownies.com
            </Box>
          </Box>

          {/* Social */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              component="a"
              href="https://www.instagram.com/nomadictownies/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              sx={{ color: "#8A8073", "&:hover": { color: "#E1306C" } }}
              size="small"
            >
              <InstagramIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.facebook.com/nomadictownies/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              sx={{ color: "#8A8073", "&:hover": { color: "#1877F2" } }}
              size="small"
            >
              <FacebookRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Copyright */}
          <Typography
            sx={{
              color: "#5A5247",
              fontSize: "12px",
              fontFamily: "Inter",
            }}
          >
            &copy; {new Date().getFullYear()} Nomadic Townies. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
