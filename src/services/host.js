import { api } from "../utils";

// Define a service using a base URL and expected endpoints
const HostApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // ------------- Get All Hosts  ---------------
    getAllHosts: builder.query({
      query: () => ({
        url: "/host",
        method: "GET",
      }),
      providesTags: ["Hosts"],
    }),

    // ------------- Get Host by ID  ---------------
    getHostById: builder.query({
      query: (hostId) => ({
        url: `/host/${hostId}`,
        method: "GET",
      }),
      providesTags: ["Hosts"],
    }),

    // ------------- Get Host Details  ---------------
    getHostDetails: builder.query({
      query: (hostId) => ({
        url: `/host/${hostId}`,
        method: "GET",
      }),
      providesTags: ["Hosts"],
    }),

    // ------------- Get Host Trips  ---------------
    getHostTrips: builder.query({
      query: (hostId) => ({
        url: `/host/${hostId}/trips`,
        method: "GET",
      }),
      providesTags: ["Hosts", "Trips"],
    }),

    // ------------- Get Host Reviews  ---------------
    getHostReviews: builder.query({
      query: (hostId) => ({
        url: `/host/${hostId}/reviews`,
        method: "GET",
      }),
      providesTags: ["Hosts", "Reviews"],
    }),
    // Reviews filed against a host (dedicated endpoint)
    getReviewsByHostId: builder.query({
      query: (hostId) => ({
        url: `/getAllReviewsByHostId/${hostId}`,
        method: "POST",
        body: {},
      }),
      providesTags: ["Reviews"],
    }),
    // Traveller writes a review for a host
    addUserReview: builder.mutation({
      query: (body) => ({
        url: "/addUserReview",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetAllHostsQuery,
  useGetHostByIdQuery,
  useGetHostDetailsQuery,
  useGetHostTripsQuery,
  useGetHostReviewsQuery,
  useGetReviewsByHostIdQuery,
  useAddUserReviewMutation,
} = HostApi;
