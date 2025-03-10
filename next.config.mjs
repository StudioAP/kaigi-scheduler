/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // TailwindCSSの最適化を有効にする
  webpack: (config) => {
    return config;
  },
};

export default nextConfig; 