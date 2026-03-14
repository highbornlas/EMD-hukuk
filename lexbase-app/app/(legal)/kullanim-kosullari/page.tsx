import { KullanimKosullari } from '@/lib/legal-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — LexBase',
  description: 'LexBase Hukuk Bürosu Yönetim Platformu kullanım koşulları ve hizmet sözleşmesi.',
};

export default function KullanimKosullariPage() {
  return (
    <article className="yasal-icerik">
      <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold mb-6">Kullanım Koşulları</h1>
      <KullanimKosullari />
    </article>
  );
}
