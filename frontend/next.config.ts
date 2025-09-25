import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint and TypeScript errors during build for production
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['localhost', 'nusantarax.web.id', 'api.nusantarax.web.id'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Bundle optimization
  compress: true,
  
  // Environment-specific settings
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
};

export default nextConfig;
