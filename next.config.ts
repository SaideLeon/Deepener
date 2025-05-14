import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    // ⚠️ Configurações futuras ainda não estão totalmente disponíveis.
    // Deixe este objeto aqui para habilitar o Turbopack no dev (via --turbo)
  },
};

export default nextConfig;

