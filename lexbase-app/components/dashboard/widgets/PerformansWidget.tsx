'use client';

import { useMemo } from 'react';
import { fmt } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════
   Aylık Performans Widget — Gelir/Gider bar chart
   ══════════════════════════════════════════════════════════════ */

interface PerformansWidgetProps {
  davalar: Array<Record<string, unknown>>;
  icralar: Array<Record<string, unknown>>;
}

export function PerformansWidget({ davalar, icralar }: PerformansWidgetProps) {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const buAy = new Date().getMonth();
  const buYil = new Date().getFullYear();

  const aylikVeri = useMemo(() => {
    const gelirler = new Array(12).fill(0);
    const giderler = new Array(12).fill(0);
    const tumDosyalar = [...(davalar || []), ...(icralar || [])];

    tumDosyalar.forEach((dosya) => {
      const tahsilatlar = dosya.tahsilatlar as Array<{ tutar: number; tarih?: string }> | undefined;
      tahsilatlar?.forEach((t) => {
        if (t.tarih) {
          const d = new Date(t.tarih);
          if (d.getFullYear() === buYil) gelirler[d.getMonth()] += t.tutar || 0;
        }
      });
      const harcamalar = dosya.harcamalar as Array<{ tutar: number; tarih?: string }> | undefined;
      harcamalar?.forEach((h) => {
        if (h.tarih) {
          const d = new Date(h.tarih);
          if (d.getFullYear() === buYil) giderler[d.getMonth()] += h.tutar || 0;
        }
      });
    });
    return { gelirler, giderler };
  }, [davalar, icralar, buYil]);

  const maxVal = Math.max(1, ...aylikVeri.gelirler, ...aylikVeri.giderler);
  const toplamVarMi = aylikVeri.gelirler.some(v => v > 0) || aylikVeri.giderler.some(v => v > 0);

  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-end gap-1.5 h-24 px-1">
        {aylar.map((ay, i) => {
          const gelirH = toplamVarMi ? (aylikVeri.gelirler[i] / maxVal) * 100 : 0;
          const giderH = toplamVarMi ? (aylikVeri.giderler[i] / maxVal) * 100 : 0;
          return (
            <div key={ay} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex gap-[1px] h-16 items-end">
                <div className={`flex-1 rounded-sm ${i === buAy ? 'bg-green' : 'bg-green/30'}`} style={{ height: `${Math.max(gelirH, 0)}%` }} title={`Gelir: ${fmt(aylikVeri.gelirler[i])}`} />
                <div className={`flex-1 rounded-sm ${i === buAy ? 'bg-red' : 'bg-red/30'}`} style={{ height: `${Math.max(giderH, 0)}%` }} title={`Gider: ${fmt(aylikVeri.giderler[i])}`} />
              </div>
              <span className={`text-[8px] ${i === buAy ? 'text-text font-bold' : 'text-text-dim'}`}>{ay}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-5 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green" /> Gelir</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red" /> Gider</span>
      </div>
    </div>
  );
}
