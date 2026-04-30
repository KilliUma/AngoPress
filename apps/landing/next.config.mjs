/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL ?? 'http://localhost:3001',
    APP_URL: process.env.APP_URL ?? 'http://localhost:5173',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'escf.ao',
        pathname: '/angopress/wp-content/uploads/**',
      },
    ],
  },
}

export default nextConfig
