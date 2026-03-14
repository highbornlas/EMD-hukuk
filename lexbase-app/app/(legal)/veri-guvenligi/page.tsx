import { VeriGuvenligi } from '@/lib/legal-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veri Güvenliği — LexBase',
  description: 'LexBase platformunun veri güvenliği politikası, teknik ve idari tedbirler.',
};

export default function VeriGuvenligiPage() {
  return (
    <article className="yasal-icerik">
      <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold mb-6">Veri Güvenliği</h1>
      <VeriGuvenligi />
    </article>
  );
}
