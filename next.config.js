/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure experimental features
  experimental: {
    // Enable Turbopack
    turbo: {
      // Configure Turbopack options
      resolveAlias: {
        // Add any module aliases here if needed
      },
    },
  },
  
  // Configure webpack for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize development builds
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }
    return config;
  },
};

module.exports = nextConfig; 