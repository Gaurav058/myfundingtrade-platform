import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@myfundingtrade/ui', '@myfundingtrade/utils', '@myfundingtrade/types'],
  output: 'standalone',
};

export default nextConfig;
