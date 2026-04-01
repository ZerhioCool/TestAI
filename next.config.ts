import type { NextConfig } from "next";

const nextConfig: any = {
  serverExternalPackages: ["pdf-parse"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
