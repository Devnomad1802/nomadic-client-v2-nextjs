import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const EnquirApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    enquir: builder.mutation({
      query: ({ Name, Phone, Email, Message, userId }) => ({
        url: "/initateEnquery",
        method: "POST",
        body: { Name, Phone, Email, Message, userId },
      }),
    }),

    // Hardened booking-enquiry fallback (checkout unavailable). Server validates,
    // dedupes and persists before returning ok.
    createBookingEnquiry: builder.mutation({
      query: (body) => ({
        url: "/booking-enquiry",
        method: "POST",
        body,
      }),
    }),

    // "Become a Host" application — routes to the Host Applications pipeline
    // (NOT customer Enquiries). Structured fields preserved for admin review.
    applyHost: builder.mutation({
      query: (body) => ({
        url: "/host-portal/apply",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useEnquirMutation, useCreateBookingEnquiryMutation, useApplyHostMutation } = EnquirApi;
