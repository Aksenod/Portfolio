import type { NextConfig } from 'next';

const basePath = '/Portfolio';

const nextConfig: NextConfig = {
  // Убираем output: 'export' в dev режиме, чтобы API роуты работали
  // Для production сборки можно вернуть через переменную окружения
  ...(process.env.NODE_ENV === 'production' && process.env.ENABLE_STATIC_EXPORT === 'true'
    ? { output: 'export' as const }
    : {}),
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
