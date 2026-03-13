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
  title: 'LexBase — Hukuk Bürosu Yönetim Sistemi',
  description: 'Avukatlar için profesyonel büro yönetimi, müvekkil takibi ve dosya yönetimi.',
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
  return (
    <html lang="tr" className={`${dmSans.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CapacitorInit />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
