"use client";

import { Component } from "react";
import { Box, Button, Container, Typography } from "@mui/material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in dev; in production this could go to a monitoring service
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container
          maxWidth="sm"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography
              sx={{
                fontSize: { xs: "48px", md: "64px" },
                fontWeight: 700,
                color: "#CF4A2C",
                mb: 2,
                fontFamily: "Inter",
              }}
            >
              Oops!
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "18px", md: "22px" },
                fontWeight: 600,
                color: "#1F2937",
                mb: 1,
                fontFamily: "Inter",
              }}
            >
              Something went wrong
            </Typography>
            <Typography
              sx={{
                fontSize: "16px",
                color: "#6B7280",
                mb: 4,
                fontFamily: "Inter",
                lineHeight: "160%",
              }}
            >
              We hit an unexpected error. Don&apos;t worry — your data is safe.
              Try going back to the homepage.
            </Typography>
            <Button
              onClick={this.handleReset}
              sx={{
                background: "#CF4A2C",
                color: "#fff",
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "16px",
                fontFamily: "Inter",
                "&:hover": { background: "#B03A1F" },
              }}
            >
              Go to Homepage
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
