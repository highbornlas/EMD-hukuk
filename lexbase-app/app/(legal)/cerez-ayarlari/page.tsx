import { CerezAyarlari } from '@/lib/legal-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Ayarları — LexBase',
  description: 'LexBase platformunun kullandığı çerezler ve yerel depolama teknolojileri hakkında bilgi.',
};

export default function CerezAyarlariPage() {
  return (
    <article className="yasal-icerik">
      <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold mb-6">Çerez Ayarları</h1>
      <CerezAyarlari />
    </article>
  );
}
