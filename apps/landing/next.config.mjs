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
