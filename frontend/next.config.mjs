/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://ms-ai.duckdns.org:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
