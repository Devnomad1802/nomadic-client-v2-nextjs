import { api } from "../utils/api";

// Booking Add-ons Engine — the catalogue for a trip. Prices shown here are for
// display only; the server re-prices the chosen add-ons when the order is made.
const AddonsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getAddons: builder.query({
      query: (tripId) => ({
        url: tripId ? `/addons?tripId=${encodeURIComponent(tripId)}` : "/addons",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAddonsQuery } = AddonsApi;
