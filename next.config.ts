import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker builds
  output: 'standalone',

  // Set output file tracing root to avoid nested directory structure
  outputFileTracingRoot: process.cwd(),

  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,

  // Optimize build performance
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
  },

  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  // Webpack configuration for memory optimization
  webpack: (config, { isServer }) => {
    // Fix "self is not defined" error in server-side builds
    if (isServer) {
      config.output = {
        ...config.output,
        // Ensure proper target for server builds
        globalObject: 'this',
      };
    }

    // Reduce memory usage with optimized split chunks
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
