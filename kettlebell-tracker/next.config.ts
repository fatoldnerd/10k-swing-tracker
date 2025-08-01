import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is the correct setting for your dynamic app
  output: 'standalone',

  // Your other settings are fine
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;