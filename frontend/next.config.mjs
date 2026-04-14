/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://sai.duckdns.org/api/:path*",
      },
    ];
  },
};

export default nextConfig;
