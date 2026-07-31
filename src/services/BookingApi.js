import { api } from "../utils";

// Define a service using a base URL and expected endpoints
const bookingApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    updateBooking: builder.mutation({
      query: ({ paymentStatus, total, status, _id }) => ({
        url: "/updateBooking",
        method: "PUT",
        body: { paymentStatus, total, status, _id },
      }),
    }),
  }),
});

export const { useUpdateBookingMutation } = bookingApis;
