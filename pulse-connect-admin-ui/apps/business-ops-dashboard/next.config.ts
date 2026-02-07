import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Business Operations Dashboard Configuration
  experimental: {
    serverComponentsExternalPackages: ['@pulsco/csi-client', '@pulsco/admin-auth-client'],
  },
  env: {
    DASHBOARD_ROLE: 'business-ops',
    CSI_METRICS_SCOPE: 'business-operations',
  },
  // Security headers for admin dashboard
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
