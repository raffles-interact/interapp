/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // except for webpack, other parts are left as generated
  webpack: (config, context) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development' ? 'http://backend:8000/api/:path*' : '/api/',
      },
    ];
  },
};

module.exports = nextConfig;
