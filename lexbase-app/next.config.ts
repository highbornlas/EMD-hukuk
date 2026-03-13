import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Capacitor mobil uygulama live URL mode kullanır
  // (deployed web app'e bağlanır, static export gerekmez)
  // Cloudflare Pages ile normal SSR/CSR devam eder
};

export default nextConfig;
