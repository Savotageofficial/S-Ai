/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://ms-ai.duckdns.org/:path*",
      },
    ];
  },
};

export default nextConfig;
