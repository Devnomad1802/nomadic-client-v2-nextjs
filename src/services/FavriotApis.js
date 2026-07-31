import { api } from "../utils";

// Define a service using a base URL and expected endpoints
const FavriotApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    updateBookmark: builder.mutation({
      query: ({ userId, bookmark, tripId }) => ({
        url: "/auth/updateBookmark",
        method: "POST",
        body: { userId, bookmark, tripId },
      }),
    }),
    getBookmarkedTrips: builder.mutation({
      query: ({ userId }) => ({
        url: "/auth/getBookmarkedTrips",
        method: "POST",
        body: { userId },
      }),
    }),
  }),
});

export const { useUpdateBookmarkMutation, useGetBookmarkedTripsMutation } =
  FavriotApis;
