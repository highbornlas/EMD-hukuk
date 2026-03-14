'use client';

import { useMemo } from 'react';
import Link from 'next/link';

interface Props {
  belgeler: Array<Record<string, unknown>>;
  muvAdMap: Record<string, string>;
}

interface SureliVekaletname {
  id: string;
  ad: string;
  muvId: string;
  muvAd: string;
  bitis: string;
  kalanGun: number;
}

export function VekaletnameSureWidget({ belgeler, muvAdMap }: Props) {
  const bugun = new Date().toISOString().slice(0, 10);

  const sureliVekaletnameler = useMemo(() => {
    const items: SureliVekaletname[] = [];

    belgeler.forEach((b) => {
      if ((b.tur as string) !== 'vekaletname') return;
      const meta = b.meta as Record<string, unknown> | undefined;
      if (!meta?.bitis) return;

      const bitis = meta.bitis as string;
      const kalan = Math.ceil((new Date(bitis).getTime() - new Date(bugun).getTime()) / (1000 * 60 * 60 * 24));

      // Sadece 30 gün içinde bitenler veya süresi dolmuşlar
      if (kalan > 30) return;

      items.push({
        id: b.id as string,
        ad: (b.ad as string) || 'Vekaletname',
        muvId: b.muvId as string,
        muvAd: muvAdMap[b.muvId as string] || '—',
        bitis,
        kalanGun: kalan,
      });
    });

    // Kalan güne göre sırala (en acil en üstte)
    return items.sort((a, b) => a.kalanGun - b.kalanGun);
  }, [belgeler, muvAdMap, bugun]);

  if (sureliVekaletnameler.length === 0) {
    return (
      <div className="text-center py-4 text-text-dim text-xs">
        Süresi yaklaşan vekaletname yok
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sureliVekaletnameler.map((v) => {
        const renk = v.kalanGun <= 0
          ? 'border-red/40 bg-red-dim'
          : v.kalanGun <= 3
          ? 'border-red/30 bg-red-dim'
          : v.kalanGun <= 15
          ? 'border-gold/30 bg-gold-dim'
          : 'border-green/30 bg-green-dim';

        const badgeRenk = v.kalanGun <= 0
          ? 'text-red bg-red-dim border-red/20'
          : v.kalanGun <= 3
          ? 'text-red bg-red-dim border-red/20'
          : v.kalanGun <= 15
          ? 'text-gold bg-gold-dim border-gold/20'
          : 'text-green bg-green-dim border-green/20';

        return (
          <Link
            key={v.id}
            href={`/muvekkillar/${v.muvId}`}
            className={`block rounded-lg border p-3 transition-all hover:border-gold/50 ${renk}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-medium text-text truncate">{v.ad}</div>
                <div className="text-[10px] text-text-muted truncate">{v.muvAd}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${badgeRenk}`}>
                {v.kalanGun <= 0 ? 'DOLMUŞ' : `${v.kalanGun} gün`}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
