import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { CapacitorInit } from '@/components/CapacitorInit';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LexBase — Hukuk Bürosu Yönetim Sistemi',
    template: '%s | LexBase',
  },
  description:
    'Avukatlar ve hukuk büroları için geliştirilmiş profesyonel dijital büro yönetim platformu. Müvekkil yönetimi, dava takibi, icra dosyaları, finansal raporlama ve takvim — tek platformda.',
  keywords: [
    'hukuk bürosu yönetim',
    'avukat yazılımı',
    'dava takip sistemi',
    'icra takip programı',
    'müvekkil yönetimi',
    'hukuk bürosu programı',
    'avukat ofis yönetimi',
    'hukuki dosya yönetimi',
    'vekalet ücreti takibi',
    'hukuk SaaS',
    'LexBase',
  ],
  authors: [{ name: 'LexBase', url: 'https://lexbase.app' }],
  creator: 'EMD Yazılım',
  metadataBase: new URL('https://lexbase.app'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://lexbase.app',
    siteName: 'LexBase',
    title: 'LexBase — Hukuk Bürosu Yönetim Sistemi',
    description:
      'Müvekkil yönetiminden dava takibine, icra dosyalarından finansal raporlara — tüm iş akışlarınız tek platformda. 30 gün ücretsiz deneyin.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'LexBase — Hukuk Bürosu Yönetim Sistemi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexBase — Hukuk Bürosu Yönetim Sistemi',
    description:
      'Avukatlar için profesyonel büro yönetim platformu. 30 gün ücretsiz.',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/lexbase-icon.svg',
    apple: '/lexbase-icon.svg',
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LexBase',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LexBase',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    url: 'https://lexbase.app',
    description:
      'Avukatlar ve hukuk büroları için geliştirilmiş profesyonel dijital büro yönetim platformu.',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY',
        description: '30 gün ücretsiz deneme',
      },
      {
        '@type': 'Offer',
        price: '399',
        priceCurrency: 'TRY',
        description: 'Profesyonel plan — aylık',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '120',
    },
  };

  return (
    <html lang="tr" className={`${dmSans.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <CapacitorInit />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
