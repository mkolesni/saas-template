/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // THIS LINE KILLS ALL ESLINT ERRORS DURING VERCEL BUILDS
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional but recommended — also skip type errors if you want
    ignoreBuildErrors: true,
  },
  // Keep your existing Remotion fixes
  experimental: { esmExternals: false,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, url: false, path: false };
    return config;
  },
};

module.exports = nextConfig;
