import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const OrderApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    order: builder.mutation({
      query: ({ amount, currency, receipt }) => ({
        url: "/order",
        method: "POST",
        body: { amount, currency, receipt },
      }),
    }),

    // ── Secure flow (C1/C2): server decides price + verifies payment ──
    createSecureOrder: builder.mutation({
      query: ({ tripId, quantities, couponCode, batchIndex, paymentType }) => ({
        url: "/createSecureOrder",
        method: "POST",
        body: { tripId, quantities, couponCode, batchIndex, paymentType },
      }),
    }),
    confirmBooking: builder.mutation({
      query: (body) => ({
        url: "/confirmBooking",
        method: "POST",
        body,
      }),
    }),
    // ── Balance top-up on an existing firstPayment booking ──
    createBalanceOrder: builder.mutation({
      query: ({ bookingId }) => ({
        url: "/createBalanceOrder",
        method: "POST",
        body: { bookingId },
      }),
    }),
    confirmBalancePayment: builder.mutation({
      query: (body) => ({
        url: "/confirmBalancePayment",
        method: "POST",
        body,
      }),
    }),
    validate: builder.mutation({
      query: ({ body }) => ({
        url: "/validate",
        method: "POST",
        body: { body },
      }),
    }),
    newBooking: builder.mutation({
      query: ({
        userId,
        bookingId,
        paymentDetail,
        cardData,
        selectedValue,
        paymentStatus,
        coupenDiscount,
      }) => ({
        url: "/newBooking",
        method: "POST",
        body: {
          userId,
          bookingId,
          paymentDetail,
          cardData,
          selectedValue,
          paymentStatus,
          coupenDiscount,
        },
      }),
    }),

    getPartialTrip: builder.mutation({
      query: ({ userId }) => ({
        url: "/getUserHoistoryTripsBookings",
        method: "POST",
        body: { userId },
      }),
    }),
  }),
});

export const {
  useOrderMutation,
  useValidateMutation,
  useNewBookingMutation,
  useGetPartialTripMutation,
  useCreateSecureOrderMutation,
  useConfirmBookingMutation,
  useCreateBalanceOrderMutation,
  useConfirmBalancePaymentMutation,
} = OrderApi;
