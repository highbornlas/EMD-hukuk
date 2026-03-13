'use client';

import { fmt } from '@/lib/utils';

interface Props {
  davaSayisi: number;
  aktifDava: number;
  finansOzet: Record<string, unknown> | null | undefined;
}

export function MuvKpiCards({ davaSayisi, aktifDava, finansOzet }: Props) {
  const masraflar = finansOzet?.masraflar as Record<string, number> | undefined;
  const avanslar = finansOzet?.avanslar as Record<string, number> | undefined;
  const bakiye = finansOzet?.bakiye as Record<string, number> | undefined;
  const vekalet = finansOzet?.vekaletUcreti as Record<string, Record<string, number>> | undefined;

  const cards = [
    { label: 'Toplam Dava', value: davaSayisi, format: 'sayi', color: 'text-text' },
    { label: 'Aktif Dava', value: aktifDava, format: 'sayi', color: 'text-gold' },
    { label: 'Toplam Masraf', value: masraflar?.toplam ?? 0, format: 'para', color: 'text-text' },
    { label: 'Alınan Avans', value: avanslar?.alinan ?? 0, format: 'para', color: 'text-green' },
    { label: 'Masraf Bakiyesi', value: bakiye?.masrafBakiye ?? 0, format: 'para', color: (bakiye?.masrafBakiye ?? 0) >= 0 ? 'text-green' : 'text-red' },
    { label: 'Vekalet Alacak', value: vekalet?.akdi?.kalan ?? 0, format: 'para', color: 'text-gold' },
  ];

  return (
    <div className="grid grid-cols-6 gap-3 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
            {card.label}
          </div>
          <div className={`font-[var(--font-playfair)] text-lg font-bold ${card.color}`}>
            {card.format === 'para' ? fmt(card.value) : card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
