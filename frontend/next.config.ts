import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // This app is its own project root. Pin it so Next.js does not walk up and
  // pick a stray lockfile from an ancestor directory as the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-project.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'br-lively-night-ay6u5eor.storage.c-5.us-east-2.aws.neon.tech',
        pathname: '/royale-relax-products/**',
      },
    ],
  },
}

export default nextConfig
