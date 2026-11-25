"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { pf1, ps1 } from "../Images";

// Accurate, customer-safe copy per failure reason. We never show a stack trace
// or a raw gateway error, and we never imply a charge was taken when it wasn't.
const REASONS = {
  // Checkout script couldn't load (slow network or an ad/privacy blocker).
  init: {
    title: "Couldn't open checkout",
    body: "We couldn't load the secure payment window. This is usually an ad or privacy blocker, or a slow connection. You have not been charged.",
    hint: "Disable blockers for nomadictownies.com (or try another browser) and tap Try Again.",
  },
  // Server couldn't create the order (maintenance is handled before this page).
  order: {
    title: "Couldn't start the payment",
    body: "Something went wrong before the payment could start. You have not been charged.",
    hint: "Please try again in a moment.",
  },
  // User dismissed the Razorpay modal.
  cancelled: {
    title: "Payment cancelled",
    body: "You closed the payment window before it finished. You have not been charged.",
    hint: "Your trip and traveller details are saved — tap Try Again to pick up where you left off.",
  },
  // A payment attempt was declined / failed inside Razorpay.
  failed: {
    title: "Payment didn't go through",
    body: "The payment couldn't be completed. If any amount was debited it is reversed automatically by your bank.",
    hint: "Try again, or use a different card / UPI app.",
  },
};

const Paymentfail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason;
  const copy = REASONS[reason] || REASONS.failed;

  return (
    <Container>
      <Box
        sx={{
          width: "100%",
          backgroundImage: `url(${ps1})`,
          height: "400px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          borderRadius: "17px",
          backgroundColor: "#EEF5FB",
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 2,
          }}
        >
          <Box sx={{ width: "100%", mb: 1 }}>
            <img src={pf1} alt="" srcSet="" style={{ width: "50px" }} />
          </Box>
          <Typography sx={{ color: "#221C17", fontSize: "28px", fontWeight: "600" }}>
            {copy.title}
          </Typography>
          <Typography sx={{ color: "#726A5E", mt: 1, maxWidth: 520 }}>
            {copy.body}
          </Typography>
          <Typography sx={{ color: "#9A9080", mt: 1, fontSize: "14px", maxWidth: 520 }}>
            {copy.hint}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          my: 3,
          gap: "0px 20px",
        }}
      >
        <Button
          onClick={() => navigate("/experiences")}
          sx={{
            color: "#E9622F",
            border: "1px solid #E9622F",
            borderRadius: "20px",
            width: "120px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => navigate(-1)}
          sx={{
            color: "#fff",
            background: "#E9622F",
            borderRadius: "20px",
            width: "120px",
            "&:hover": { background: "#CF4A2C" },
          }}
        >
          Try Again
        </Button>
      </Box>

      <Typography sx={{ textAlign: "center", color: "#9A9080", fontSize: "13px", mb: 4 }}>
        Charged but not confirmed? Email{" "}
        <a href="mailto:support@nomadictownies.com" style={{ color: "#E9622F", fontWeight: 600, textDecoration: "none" }}>
          support@nomadictownies.com
        </a>{" "}
        — do not pay again until we confirm.
      </Typography>
    </Container>
  );
};

export default Paymentfail;
