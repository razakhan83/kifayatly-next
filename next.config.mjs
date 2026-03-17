const nextConfig = {
  turbopack: {
    debugIds: true,
  },
  reactCompiler: true,
  cacheComponents: true,
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
