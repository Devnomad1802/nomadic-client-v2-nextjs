import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
export const baseImage = baseUrl.replace("/api", "");

// ── Perf: serve DigitalOcean Spaces assets from the CDN edge, not the origin.
// The origin host (sgp1.digitaloceanspaces.com) is ~40x slower (seen 56s vs
// 1.4s for the same 1.6MB image). The CDN subdomain is the cached edge.
// Rewrite every origin URL in API responses once, globally.
const SPACES_ORIGIN = ".sgp1.digitaloceanspaces.com";
const SPACES_CDN = ".sgp1.cdn.digitaloceanspaces.com";
export const toCdn = (url) =>
  typeof url === "string" && url.includes(SPACES_ORIGIN) && !url.includes(".cdn.")
    ? url.split(SPACES_ORIGIN).join(SPACES_CDN)
    : url;

const cdnifyDeep = (val) => {
  if (typeof val === "string") return toCdn(val);
  if (Array.isArray(val)) return val.map(cdnifyDeep);
  if (val && typeof val === "object") {
    for (const k in val) val[k] = cdnifyDeep(val[k]);
    return val;
  }
  return val;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      headers.set("Authorization", token);
    }
    return headers;
  },
});

const baseQueryWithCdn = async (args, apiArg, extra) => {
  const result = await rawBaseQuery(args, apiArg, extra);
  if (result?.data) result.data = cdnifyDeep(result.data);
  return result;
};

export const api = createApi({
  reducerPath: "apis",
  tagTypes: ["Hosts", "Trips", "Reviews", "Categories", "User", "Users", "Bookings", "Wishlist"],
  baseQuery: baseQueryWithCdn,
  endpoints: () => ({}),
});
