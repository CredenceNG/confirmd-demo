import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental features that might cause issues
  experimental: {
    // Turbopack is causing crashes, so we avoid using it for now
  },
};

export default nextConfig;
