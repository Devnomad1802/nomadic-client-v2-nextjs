import { api } from "../utils/api";

// Define a service using a base URL and expected endpoints
const BlogApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getAllBlogs: builder.query({
      query: () => ({
        url: "/getAllBlogs",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllBlogsQuery } = BlogApis;
