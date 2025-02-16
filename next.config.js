/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/ai-score',
        destination: 'http://151.145.40.57/api/score'
      }
    ]
  }
}

module.exports = nextConfig 