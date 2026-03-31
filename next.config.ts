
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 🔥 تحصين اتصالات بيئة التطوير السيادية لمنع عطل الـ Manifest
  experimental: {
    allowedDevOrigins: [
      "6000-firebase-studio-1774815253377.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev",
      "*.cloudworkstations.dev",
      "localhost:9002"
    ],
  },
};

export default nextConfig;
