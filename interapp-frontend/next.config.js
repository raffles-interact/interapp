/** @type {import('next').NextConfig} */
const path = require('path');
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // except for webpack, other parts are left as generated
  webpack: (config, context) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src'),
      '@api': path.resolve('./src/api'),
      '@components': path.resolve('./src/components'),
      '@providers': path.resolve('./src/providers'),
      '@hooks': path.resolve('./src/hooks'),
    };
    return config;
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/:path*`,
      },
      {
        source: '/assets/:path*',
        destination: `http://${process.env.MINIO_HOST}:${process.env.MINIO_PORT}/interapp-minio/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports:
      process.env.NODE_ENV === 'production'
        ? [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/form',
            '@mantine/dates',
            '@mantine/notifications',
          ]
        : [],
  },
  sentry: {
    tunnelRoute: '/sentry',
    hideSourceMaps: true,
  },
};
const sentryWebpackPluginOption = {
  org: process.env.SENTRY_ORGANISATION,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOption);
