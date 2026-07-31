import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const TripApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getTrips: builder.query({
      query: () => ({
        url: "/GetAllTripsForUser",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetTripsQuery } = TripApis;
