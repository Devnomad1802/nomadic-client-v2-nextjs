import { api } from "../utils/api";
const AboutApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getTeamMembers: builder.query({
      query: () => ({
        url: "/getAllTeamMember",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetTeamMembersQuery } = AboutApi;
