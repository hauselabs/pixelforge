import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Rewrite /.well-known/surf.json to the Surf API route for discovery.
  // When @surfjs/next >=0.4.0 ships, replace this with surfMiddleware():
  //   import { surfMiddleware } from '@surfjs/next/middleware'
  //   // middleware.ts: export default surfMiddleware()
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
