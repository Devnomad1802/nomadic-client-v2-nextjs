import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const ReviewsApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getAllReviews: builder.query({
      query: () => ({
        url: "/getAllReviews",
        method: "GET",
      }),
    }),
    // Reviews for ONE trip only — strict tripId isolation (server-filtered).
    getUserReviewsByTripId: builder.query({
      query: (tripId) => ({
        url: `/getUserReviewsByHostId/${tripId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllReviewsQuery, useGetUserReviewsByTripIdQuery } = ReviewsApis;

// ── Post-trip review system (JWT; token auto-attached by baseQuery) ──
const TripReviewApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // multipart FormData: bookingId, rating, review, wouldRecommend, photos[]
    submitTripReview: builder.mutation({
      query: (formData) => ({
        url: "/submitTripReview",
        method: "POST",
        body: formData,
      }),
    }),
    getMyReviews: builder.query({
      query: () => ({ url: "/myReviews", method: "GET" }),
    }),
    getMyPendingReviews: builder.query({
      query: () => ({ url: "/myPendingReviews", method: "GET" }),
    }),
  }),
});

export const {
  useSubmitTripReviewMutation,
  useGetMyReviewsQuery,
  useGetMyPendingReviewsQuery,
} = TripReviewApis;
