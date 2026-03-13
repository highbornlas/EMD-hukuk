import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Yapılandırması
 *
 * 2 Mod:
 * 1. Live URL Mode (Production) — server.url ile deploy edilmiş web app'e bağlanır
 *    → Dinamik rotalar çalışır, güncellemeler anında yansır
 * 2. Dev Mode — url: 'http://10.0.2.2:3000' (Android) veya 'http://localhost:3000' (iOS)
 *
 * NOT: Static export (webDir: 'out') [id] rotaları ile uyumsuz olduğu için
 *      live URL mode tercih edilmiştir.
 */

const isDev = process.env.CAPACITOR_ENV === 'dev';

const config: CapacitorConfig = {
  appId: 'app.lexbase.hukuk',
  appName: 'LexBase',
  webDir: 'public', // Fallback dizini — live URL mode'da kullanılmaz

  server: {
    // Production: Cloudflare Pages üzerindeki deployed URL
    // Dev: Lokal dev server
    ...(isDev
      ? { url: 'http://10.0.2.2:3000', cleartext: true }
      : { url: 'https://lexbase.app' } // Kendi domain adresinizi buraya yazın
    ),
    androidScheme: 'https',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0D0D0D',
      showSpinner: true,
      spinnerColor: '#C9A96E',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0D0D0D',
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },

  // iOS ayarları
  ios: {
    contentInset: 'automatic',
    scheme: 'LexBase',
  },

  // Android ayarları
  android: {
    allowMixedContent: false,
    backgroundColor: '#0D0D0D',
  },
};

export default config;
