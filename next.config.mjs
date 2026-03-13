/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: false,
  reactCompiler: true,
  turbopack: {
    debugIds: true,
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
