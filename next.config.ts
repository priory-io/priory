import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  poweredByHeader: false,

  reactStrictMode: true,

  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    reactCompiler: true,
    cssChunking: "strict",
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        pathname: "**/*",
      },
      {
        protocol: "http",
        hostname: "*",
        pathname: "**/*",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },

  logging: {
    fetches: {
      fullUrl: !isProd,
    },
  },
};

export default nextConfig;
