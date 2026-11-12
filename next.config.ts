import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/organization/profile": [
      "node_modules/sharp/**/*",
      "node_modules/@img/sharp-linux-x64/**/*",
      "node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
    "/api/units/profile": [
      "node_modules/sharp/**/*",
      "node_modules/@img/sharp-linux-x64/**/*",
      "node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
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