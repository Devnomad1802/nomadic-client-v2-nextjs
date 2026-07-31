"use client";

import { Box, Grid, Skeleton } from "@mui/material";

/**
 * Skeleton placeholder for trip cards in listings.
 * Matches the layout of January.jsx trip cards.
 */
export const TripCardSkeleton = ({ count = 3 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid xs={12} sm={6} md={4} key={i}>
          <Box
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Image placeholder */}
            <Skeleton
              variant="rectangular"
              sx={{
                width: "100%",
                height: { xs: "200px", sm: "250px" },
                borderRadius: "16px 16px 0 0",
              }}
              animation="wave"
            />
            {/* Content */}
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton variant="text" width="80%" height={28} animation="wave" />
              <Skeleton variant="text" width="50%" height={20} animation="wave" />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Skeleton variant="text" width="30%" height={20} animation="wave" />
                <Skeleton
                  variant="rounded"
                  width={80}
                  height={28}
                  sx={{ borderRadius: "15px" }}
                  animation="wave"
                />
              </Box>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Skeleton placeholder for category swiper cards.
 */
export const CategoryCardSkeleton = ({ count = 3 }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            flex: "0 0 calc(33.33% - 12px)",
            minWidth: { xs: "280px", sm: "auto" },
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: "100%",
              height: { xs: "280px", sm: "384px" },
              borderRadius: "16px",
            }}
            animation="wave"
          />
        </Box>
      ))}
    </Box>
  );
};

/**
 * Skeleton placeholder for blog cards.
 */
export const BlogCardSkeleton = ({ count = 3 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid xs={12} sm={6} md={4} key={i}>
          <Box sx={{ borderRadius: "16px", overflow: "hidden" }}>
            <Skeleton
              variant="rectangular"
              sx={{ width: "100%", height: 200, borderRadius: "16px 16px 0 0" }}
              animation="wave"
            />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" width="90%" height={24} animation="wave" />
              <Skeleton variant="text" width="70%" height={18} animation="wave" />
              <Skeleton variant="text" width="40%" height={18} animation="wave" sx={{ mt: 1 }} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
