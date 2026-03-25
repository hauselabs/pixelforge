import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/.well-known/surf.json',
        destination: '/api/surf',
      },
    ]
  },
}

export default nextConfig
