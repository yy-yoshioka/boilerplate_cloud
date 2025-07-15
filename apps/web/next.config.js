const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com', 'images.unsplash.com'],
  },
  transpilePackages: [],
};

module.exports = nextConfig;
