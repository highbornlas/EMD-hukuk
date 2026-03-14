import { GizlilikPolitikasi } from '@/lib/legal-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — LexBase',
  description: 'LexBase Hukuk Bürosu Yönetim Platformu gizlilik politikası ve veri işleme süreçleri.',
};

export default function GizlilikPolitikasiPage() {
  return (
    <article className="yasal-icerik">
      <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold mb-6">Gizlilik Politikası</h1>
      <GizlilikPolitikasi />
    </article>
  );
}
