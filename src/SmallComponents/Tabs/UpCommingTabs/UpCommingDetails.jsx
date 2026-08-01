"use client";

import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import { line } from "../../../Images";
import DetailUpcomming from "./DetailUpcomming";
import LoginModal from "../../../Modals/LoginModal";
import { useGetTripsQuery } from "../../../services/TripApis";
import { extractRating } from "../../../utils";
import { Helmet } from "react-helmet-async";
import Footer from "../../../Component/Footer";
import BookingSidebar from "../../BookingSidebar";

const UpcommingDetails = () => {
  const [openL, setOpenL] = useState(false);
  const toggelModelL = () => setOpenL(!openL);
  const { userDbData } = useSelector((store) => store.global);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { slug } = useParams();
  const { data } = useGetTripsQuery();

  const [tripsData, setTripsData] = useState(data?.data);
  useEffect(() => {
    if (data) setTripsData(data?.data);
  }, [data]);

  const item =
    tripsData &&
    (tripsData.find((t) => t.seoSlug && t.seoSlug === slug) ||
      tripsData.find((t) => t._id === slug));

  if (!item) {
    return <Typography>Item not found</Typography>;
  }

  const handleBookNowClick = () => {
    if (!userDbData) {
      setOpenL(true);
      return;
    }
    navigate("/payment", { state: { paymentDetail: item } });
  };

  const infoPills = [
    { icon: <AccessTimeIcon />, text: `${item?.nights}N / ${item?.days}D` },
    { icon: <FmdGoodOutlinedIcon />, text: item.location },
  ];

  return (
    <Box>
      <Helmet>
        <title>{item?.title ? `${item.title} | Book Now | Nomadic Townies` : "Trip Details | Nomadic Townies"}</title>
        <meta name="description" content={item?.subTitle ? `${item.subTitle} — ${item?.nights}N/${item?.days}D trip from ${item?.pickUp}. Starting ₹${item?.price}/person. Book with Nomadic Townies.` : "Book this amazing trip with Nomadic Townies."} />
        <link rel="canonical" href={`https://www.nomadictownies.com/trips/${item?.seoSlug || slug}`} />
        <meta property="og:title" content={item?.title ? `${item.title} | Nomadic Townies` : "Trip Details | Nomadic Townies"} />
        <meta property="og:description" content={item?.subTitle || "Book this amazing trip with Nomadic Townies."} />
        <meta property="og:image" content={item?.bannerImage || "https://www.nomadictownies.com/nt.png"} />
        <meta property="og:url" content={`https://www.nomadictownies.com/trips/${item?.seoSlug || slug}`} />
        <meta property="og:type" content="product" />
        {item && <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          "name": item.title,
          "description": item.subTitle,
          "image": item.bannerImage,
          "touristType": "Adventure",
          "offers": { "@type": "Offer", "price": item.price, "priceCurrency": "INR", "availability": "https://schema.org/InStock" },
          "provider": { "@type": "Organization", "name": "Nomadic Townies", "url": "https://www.nomadictownies.com" },
          "itinerary": { "@type": "ItemList", "name": `${item.nights}N / ${item.days}D`, "numberOfItems": item.days }
        })}</script>}
      </Helmet>

      <LoginModal openL={openL} setOpenL={setOpenL} toggelModelL={toggelModelL} />

      {/* Breadcrumbs */}
      <Container maxWidth="xl" sx={{ pt: { xs: 10, lg: 2 }, pb: 0, px: { xs: 2, md: 3 } }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2, fontSize: "14px" }}>
          <Link underline="hover" color="inherit" href="/" sx={{ cursor: "pointer" }}>Home</Link>
          <Link underline="hover" color="inherit" href="/experiences" sx={{ cursor: "pointer" }}>Trips</Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>{item?.title || "Trip Details"}</Typography>
        </Breadcrumbs>
      </Container>

      {/* Banner Image */}
      <Container maxWidth="xl" sx={{ px: { xs: 0, md: 0 } }}>
        <Box sx={{ width: "100%", height: { xs: "240px", md: "360px" }, borderRadius: "20px", mb: 4, mt: { xs: 2, lg: 0 }, position: "relative", overflow: "hidden" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "absolute", top: "20px", width: "100%", px: { xs: 1, md: 2 }, zIndex: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ background: "#FBF6EE", "&:hover": { background: "#e1e2e3" } }}>
              <KeyboardBackspaceIcon sx={{ color: "#5A5247" }} />
            </IconButton>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ background: "#FBF6EE", "&:hover": { background: "#e1e2e3" } }}>
                <ShareIcon sx={{ color: "#5A5247" }} />
              </IconButton>
              <IconButton sx={{ background: "#FBF6EE", "&:hover": { background: "#e1e2e3" } }}>
                <FavoriteBorderIcon sx={{ color: "#5A5247" }} />
              </IconButton>
            </Box>
          </Box>
          <img
            src={item?.bannerImage}
            alt={item?.title ? `${item.title} - ${item.location || ""} Trip | Nomadic Townies` : "Adventure trip"}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px" }}
          />
        </Box>
      </Container>

      {/* ========= TWO-COLUMN LAYOUT ========= */}
      {/* Left: trip info + tabs  |  Right: sticky booking card */}
      <Container maxWidth="xl">
        {/* alignItems:stretch (default) lets the right column match the tall
            left column's height, giving the sticky booking card room to travel */}
        <Grid container spacing={4}>

          {/* LEFT COLUMN */}
          <Grid item xs={12} md={7.5}>
            {/* Title + subtitle + rating */}
            <Typography sx={{ color: "#3C3228", fontWeight: 600, fontSize: { xs: "22px", sm: "28px", lg: "33px" }, textAlign: "left", fontFamily: "Inter" }}>
              {item.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <Typography sx={{ color: "#726A5E", fontSize: { xs: "13px", sm: "15px" }, textAlign: "left", fontFamily: "Inter" }}>
                {item.subTitle}
              </Typography>
              <Box sx={{ background: "#F4C95D", borderRadius: "32px", display: "flex", alignItems: "center", px: 1.5, height: "28px" }}>
                <StarBorderIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{extractRating(item?.ratings)}</Typography>
              </Box>
            </Box>

            {/* Info pills */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {infoPills.map((pill, i) => (
                <Box key={i} sx={{ background: "#FBF6EE", border: "1px solid #F1EADD", borderRadius: "32px", display: "flex", alignItems: "center", gap: 1, pr: 1.5 }}>
                  <IconButton size="small" sx={{ background: "#7DCD85", color: "#fff", "&:hover": { color: "#7DCD85" } }}>
                    {pill.icon}
                  </IconButton>
                  <Typography sx={{ color: "#221C17", fontSize: { xs: "13px", sm: "15px" }, fontFamily: "Inter" }}>{pill.text}</Typography>
                </Box>
              ))}
            </Box>

            {/* Pickup / Drop-off — full width, centered */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Box sx={{ background: "#FBF6EE", border: "1px solid #F1EADD", borderRadius: "40px", display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2.5 }, py: 1.5, px: { xs: 3, md: 5 }, width: { xs: "100%", sm: "auto" }, justifyContent: "center" }}>
                <Typography sx={{ color: "#726A5E", fontSize: { xs: "14px", md: "16px" }, fontFamily: "Inter" }}>Pick Up:</Typography>
                <Typography sx={{ color: "#221C17", fontSize: { xs: "14px", md: "16px" }, fontWeight: 600, fontFamily: "Inter" }}>{item.pickUp}</Typography>
                <Box sx={{ width: { xs: "40px", md: "60px" }, display: "flex", alignItems: "center" }}>
                  <img src={line} alt="" style={{ width: "100%" }} />
                </Box>
                <Typography sx={{ color: "#726A5E", fontSize: { xs: "14px", md: "16px" }, fontFamily: "Inter" }}>Drop Off:</Typography>
                <Typography sx={{ color: "#221C17", fontSize: { xs: "14px", md: "16px" }, fontWeight: 600, fontFamily: "Inter" }}>{item.dropOff}</Typography>
              </Box>
            </Box>

            {/* Booking card on mobile (shown above tabs) */}
            <Box sx={{ display: { xs: "block", md: "none" }, mt: 3 }}>
              <BookingSidebar item={item} onBookNow={handleBookNowClick} />
            </Box>

            {/* Detail tabs */}
            <Box sx={{ mt: 4 }}>
              <DetailUpcomming tripDetail={item} />
            </Box>
          </Grid>

          {/* RIGHT COLUMN — sticky booking card (desktop) */}
          <Grid item md={4.5} sx={{ display: { xs: "none", md: "block" } }}>
            <Box sx={{ position: "sticky", top: "20px" }}>
              <BookingSidebar item={item} onBookNow={handleBookNowClick} />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Mobile fixed Book Now bar */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: "#fff",
          borderTop: "1px solid #E6DDCF",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
          px: 2,
          py: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#3C3228", fontFamily: "Inter" }}>
              &#8377;{item?.price}
            </Typography>
            {item?.strikePrice && Number(item.strikePrice) > Number(item.price) && (
              <Typography sx={{ fontSize: "13px", color: "#8A8073", textDecoration: "line-through" }}>
                &#8377;{item.strikePrice}
              </Typography>
            )}
          </Box>
          <Typography sx={{ fontSize: "11px", color: "#726A5E", fontFamily: "Inter" }}>per person</Typography>
        </Box>
        <Button
          onClick={handleBookNowClick}
          sx={{
            background: "#CF4A2C",
            color: "#fff",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "15px",
            fontFamily: "Inter",
            px: 4,
            py: 1.2,
            boxShadow: "0 8px 20px -8px rgba(210,75,42,.6)",
            "&:hover": { background: "#b53c20" },
          }}
        >
          Book Now
        </Button>
      </Box>
      <Box sx={{ display: { xs: "block", md: "none" }, height: "72px" }} />

      <Footer />
    </Box>
  );
};

export default UpcommingDetails;
