import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const TrendingApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    GetTrendingTrips: builder.query({
      query: () => ({
        url: "/GetTrendingTrips",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetTrendingTripsQuery } = TrendingApi;
