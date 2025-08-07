import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Enable static optimization for faster builds
  reactStrictMode: true,
  // Disable image optimization if not needed
  // images: { unoptimized: true },
};

export default nextConfig;
