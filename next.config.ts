import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/organization",
        destination: "/kosek-iv",
        permanent: false,
      },
      {
        source: "/organization/:path*",
        destination: "/kosek-iv/:path*",
        permanent: false,
      },
      {
        source: "/units",
        destination: "/satrad",
        permanent: false,
      },
      {
        source: "/units/:path*",
        destination: "/satrad/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;