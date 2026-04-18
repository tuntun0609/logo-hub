import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  turbopack: {
    resolveAlias: {
      fs: { browser: './src/lib/noop.js' },
      path: { browser: './src/lib/noop.js' },
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'oss.logohub.art',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/tools/background-remover',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]
  },
}

export default nextConfig
