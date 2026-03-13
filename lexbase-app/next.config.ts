import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Workers ile deploy (opennextjs/cloudflare)
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
