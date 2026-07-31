import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const CategoraiesApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => ({
        url: "/getAllCategories",
        method: "GET",
      }),
    }),
    GetTripsByCagtegory: builder.mutation({
      query: ({ categories }) => ({
        url: "/GetTripsByCagtegory",
        method: "POST",
        body: { categories },
      }),
    }),
  }),
});

export const { useGetAllCategoriesQuery, useGetTripsByCagtegoryMutation } =
  CategoraiesApis;
