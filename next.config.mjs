/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
};

export default nextConfig;
