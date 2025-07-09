// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'cdn.example.com'],
  },
  eslint: {
    // CI ビルド時も ESLint で fail させる
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
