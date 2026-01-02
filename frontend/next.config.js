/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['walrus.sui.io', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aggregator.walrus.sui.io',
      },
      {
        protocol: 'https',
        hostname: 'publisher.walrus.sui.io',
      },
    ],
  },
  // Suppress hydration warnings for browser extension attributes
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Remove fdprocessedid and other browser extension attributes
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable static optimization for pages using client-only hooks
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig

