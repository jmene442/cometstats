import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Hono runs on Node.js runtime via API routes — no special config needed.
  // Update this if you ever switch to edge runtime.
  experimental: {
    // Enables typed routes (optional but nice to have)
    typedRoutes: false,
  },
}

export default nextConfig
