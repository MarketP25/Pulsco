import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    SUPERADMIN_DASHBOARD: 'true',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // Proxy to main admin API
      },
    ]
  },
}

export default nextConfig
