import type { NextConfig } from "next";

const isProd: boolean = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: isProd,
  },
  eslint: {
    ignoreDuringBuilds: isProd,
  },
  typescript: {
    ignoreBuildErrors: isProd,
  },
  experimental: {
    reactCompiler: isProd,
    cssChunking: isProd,
  }
};

export default nextConfig;
