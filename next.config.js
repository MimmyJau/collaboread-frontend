/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER: process.env.SERVER,
    SLUG: process.env.SLUG,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
