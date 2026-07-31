import { api } from "../utils/api";

// Platform chat between the logged-in traveller and a host.
const HostChatApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    startHostChat: builder.mutation({
      query: ({ hostId, message }) => ({
        url: "/host-chat/start",
        method: "POST",
        body: { hostId, message },
      }),
    }),
    getMyHostChats: builder.mutation({
      query: () => ({ url: "/host-chat/mine", method: "GET" }),
    }),
    sendHostChatMessage: builder.mutation({
      query: ({ id, message }) => ({
        url: `/host-chat/${id}/message`,
        method: "POST",
        body: { message },
      }),
    }),
    markHostChatRead: builder.mutation({
      query: ({ id }) => ({ url: `/host-chat/${id}/read`, method: "POST" }),
    }),
  }),
});

export const {
  useStartHostChatMutation,
  useGetMyHostChatsMutation,
  useSendHostChatMessageMutation,
  useMarkHostChatReadMutation,
} = HostChatApi;
