import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@pocket-ops/schema', '@pocket-ops/ui'],
};

export default nextConfig;
