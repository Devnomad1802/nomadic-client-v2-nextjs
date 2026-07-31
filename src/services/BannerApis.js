import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const BannerApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getAllBanner: builder.query({
      query: () => ({
        url: "/getCoverImages",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllBannerQuery } = BannerApis;
