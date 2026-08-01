"use client";

import { Avatar, Box, Card, Grid, Rating, Typography } from "@mui/material";

const Reviews = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      trip: "Himalayan Base Camp Trek",
      rating: 5,
      review:
        "Absolutely incredible experience! The guides were professional, knowledgeable, and made sure everyone felt safe throughout the trek. The views were breathtaking and the organization was flawless.",
      helpful: 12,
      timeAgo: "2 weeks ago",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 2,
      name: "Raj Patel",
      trip: "Alpine Meadow Adventure",
      rating: 5,
      review:
        "An unforgettable journey through pristine alpine meadows. The team's attention to detail and safety protocols were outstanding. Highly recommend for anyone seeking adventure!",
      helpful: 8,
      timeAgo: "1 month ago",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 3,
      name: "Maya Singh",
      trip: "High Altitude Expedition",
      rating: 5,
      review:
        "The high altitude expedition was challenging but incredibly rewarding. Our guides were experienced and supportive throughout. The views from the summit were absolutely spectacular!",
      helpful: 5,
      timeAgo: "3 weeks ago",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ];

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Reviews Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
              color: "#3C3228",
              fontSize: { xs: "28px", sm: "32px", md: "36px" },
              fontFamily:
                "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            Reviews
          </Typography>

          <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Rating
                value={4.9}
                precision={0.1}
                readOnly
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#FFD700",
                  },
                  "& .MuiRating-iconHover": {
                    color: "#FFD700",
                  },
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "#3C3228",
                  fontSize: { xs: "20px", sm: "24px" },
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                4.9
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: "#726A5E",
                fontSize: { xs: "14px", sm: "16px" },
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Based on 247 reviews
            </Typography>
          </Box>
        </Box>

        {/* Reviews Grid */}
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card
                sx={{
                  borderRadius: "16px",
                  padding: { xs: "20px", sm: "24px" },
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                  background: "white",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {/* Reviewer Info */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Avatar
                    src={review.avatar}
                    sx={{
                      width: { xs: "48px", sm: "56px" },
                      height: { xs: "48px", sm: "56px" },
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 500,
                        color: "#3C3228",
                        fontSize: { xs: "16px", sm: "18px" },
                        textAlign: "left",
                        fontFamily:
                          "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                        mb: 0.5,
                      }}
                    >
                      {review.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#726A5E",
                        fontSize: { xs: "13px", sm: "13px" },
                        textAlign: "left",
                        fontFamily:
                          "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      {review.trip}
                    </Typography>
                  </Box>
                </Box>

                {/* Review Content */}
                <Typography
                  variant="body1"
                  sx={{
                    color: "#3C3228",
                    lineHeight: 1.7,
                    mb: 3,
                    ml: { xs: 7, sm: 9 },
                    fontSize: { xs: "13px", sm: "16px" },
                    textAlign: "left",
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {review.review}
                </Typography>

                {/* Review Footer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#726A5E",
                        fontSize: { xs: "12px", sm: "14px" },
                        ml: { xs: 7, sm: 9 },
                        fontFamily:
                          "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                        cursor: "pointer",
                        "&:hover": {
                          color: "#CF4A2C",
                        },
                      }}
                    >
                      Helpful ({review.helpful})
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#FFD700",
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#726A5E",
                        fontSize: { xs: "12px", sm: "14px" },
                        fontFamily:
                          "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      {review.timeAgo}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Reviews;
