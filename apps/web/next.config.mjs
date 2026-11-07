import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['vela-sdk', '@vela/types'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Resolve vela-sdk to its TypeScript source so Next.js can transpile it
    // directly instead of relying on a pre-built dist/ folder.
    config.resolve.alias['vela-sdk'] = path.resolve(
      __dirname,
      '../../packages/sdk/src',
    );
    // The SDK source uses ESM `.js` specifiers (which become `.ts` files here).
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
