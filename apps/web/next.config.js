/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@agentland-saarland/ui", "@agentland-saarland/shared"],
  images: {
    domains: ['localhost', 'agentland.saarland'],
  },
  i18n: {
    locales: ['de', 'fr', 'en'],
    defaultLocale: 'de',
  },
}

module.exports = nextConfig