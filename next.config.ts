import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Match any HTTPS or HTTP host, any path, any extension
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  output: "standalone",
};

export default nextConfig;
