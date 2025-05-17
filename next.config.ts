import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.nftmunich.club"], // Add your Strapi API domain here
  },
};

export default nextConfig;
