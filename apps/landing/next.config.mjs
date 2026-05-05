/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
  env: {
    API_URL: process.env.API_URL ?? 'http://localhost:3001',
    APP_URL: process.env.APP_URL ?? 'http://localhost:5173',
  },
  images: {
    domains: ['escf.ao'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'escf.ao',
        pathname: '/angopress/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'escf.ao',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
}

export default nextConfig
