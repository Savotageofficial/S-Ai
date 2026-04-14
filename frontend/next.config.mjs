/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://ms-ai.duckdns.org/:path*",
      },
    ];
  },
};

export default nextConfig;
