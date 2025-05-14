/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo estrito do React
  reactStrictMode: true,

  // Nova forma de ativar o Turbopack (fora de `experimental`)
  turbopack: {
    // Adicione opções específicas se necessário (ex: aliases de módulos)
    resolveAlias: {
      // Exemplo: 'old-module': 'new-module'
    },
  },

  // Configurações personalizadas para o Webpack (caso ainda use)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
