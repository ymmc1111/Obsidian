import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@pocket-ops/schema', '@pocket-ops/ui'],
  output: 'standalone',
};

export default nextConfig;
