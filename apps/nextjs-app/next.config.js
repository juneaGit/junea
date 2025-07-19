import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'recharts'],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimiser les performances de webpack
    if (dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // Améliorer la résolution des modules pour Vercel
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    config.resolve.modules = ['node_modules', 'src'];
    
    // Réduire les avertissements de bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      punycode: false, // Fix punycode deprecation warning
    };
    
    return config;
  },
  // Supprimer les avertissements punycode
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Fix images configuration (NEW)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Réduire la verbosité des logs
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig; 