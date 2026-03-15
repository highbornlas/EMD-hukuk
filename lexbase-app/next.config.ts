import type { NextConfig } from 'next';

// Security headers
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://cloudflareinsights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Cloudflare Workers ile deploy (opennextjs/cloudflare)
  images: {
    unoptimized: true,
  },
  // Bundle boyutunu küçültme
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      'framer-motion',
    ],
  },
  // Security headers — tüm rotalar için
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

// Dev ortamında Cloudflare bindings emülasyonu
if (process.env.NODE_ENV === 'development') {
  try {
    const mod = require('@opennextjs/cloudflare');
    if (mod.initOpenNextCloudflareForDev) {
      mod.initOpenNextCloudflareForDev();
    }
  } catch {
    // OpenNext dev helper yüklenemedi — sorun değil
  }
}

export default nextConfig;
