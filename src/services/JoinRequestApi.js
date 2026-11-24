import { api } from "../utils/api";

/* Host-approval booking — traveller side. Additive; instant trips never use it. */
const JoinRequestApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Submit a Request to Join an approval-required trip.
    applyToTrip: builder.mutation({
      query: ({ tripId, batchIndex, partySize, bookingOption, answers }) => ({
        url: "/join-requests/apply",
        method: "POST",
        body: { tripId, batchIndex, partySize, bookingOption, answers },
      }),
      invalidatesTags: ["joinRequests"],
    }),
    // The signed-in traveller's own applications (status + next action).
    myApplications: builder.query({
      query: () => ({ url: "/join-requests/mine", method: "GET" }),
      providesTags: ["joinRequests"],
    }),
    withdrawApplication: builder.mutation({
      query: (id) => ({ url: `/join-requests/${id}/withdraw`, method: "POST" }),
      invalidatesTags: ["joinRequests"],
    }),
  }),
});

export const {
  useApplyToTripMutation,
  useMyApplicationsQuery,
  useWithdrawApplicationMutation,
} = JoinRequestApi;
export default JoinRequestApi;
