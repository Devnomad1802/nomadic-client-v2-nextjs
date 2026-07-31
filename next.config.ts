import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
