import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const CoupenApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // ------------- Get All Copuns  ---------------
    getAllCoupon: builder.query({
      query: () => ({
        url: "/getAllCoupon",
        method: "GET",
      }),
      providesTags: ["Coupons"],
    }),
  }),
});

export const { useGetAllCouponQuery } = CoupenApi;
