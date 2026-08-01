import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonical host: apex → www, 301 permanent, path + query preserved,
      // HTTPS kept. `has` host match runs server-side (edge) with no loop
      // (destination host is www, which no longer matches the apex condition).
      {
        source: "/:path*",
        has: [{ type: "host", value: "nomadictownies.com" }],
        destination: "https://www.nomadictownies.com/:path*",
        permanent: true,
      },
      {
        source: "/blogs",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/Details/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
      {
        source: "/blogs/Details/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:5001/api"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
