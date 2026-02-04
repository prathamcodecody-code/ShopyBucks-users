/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apiv2.shopybucks.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.firstfemale.in",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
