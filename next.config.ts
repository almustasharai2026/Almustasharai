
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  // تم تنقية الإعدادات التجريبية لضمان استقرار إقلاع الخادم السيادي
  experimental: {
    // تم إزالة allowedDevOrigins لعدم توافقه مع معايير Next.js 15 الحالية
  },
};

export default nextConfig;
