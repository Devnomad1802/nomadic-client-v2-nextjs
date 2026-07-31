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
  }),
});

export const { useEnquirMutation } = EnquirApi;
