import { KvkkAydinlatma } from '@/lib/legal-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni — LexBase',
  description: 'LexBase 6698 sayılı KVKK kapsamında kişisel verilerin korunması aydınlatma metni.',
};

export default function KvkkPage() {
  return (
    <article className="yasal-icerik">
      <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold mb-6">KVKK Aydınlatma Metni</h1>
      <KvkkAydinlatma />
    </article>
  );
}
