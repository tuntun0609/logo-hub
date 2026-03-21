import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      fs: { browser: './src/lib/noop.js' },
      path: { browser: './src/lib/noop.js' },
    },
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
