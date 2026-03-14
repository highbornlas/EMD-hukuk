'use client';

import { useMemo } from 'react';
import { fmt, fmtTarih } from '@/lib/utils';
import { EmptyState } from '../WidgetWrapper';

/* ══════════════════════════════════════════════════════════════
   Son Aktiviteler Widget — Gerçek zaman çizelgesi
   ══════════════════════════════════════════════════════════════ */

interface AktiviteWidgetProps {
  davalar: Array<Record<string, unknown>>;
  icralar: Array<Record<string, unknown>>;
  gorevler: Array<Record<string, unknown>>;
  muvAdMap: Record<string, string>;
}

export function AktiviteWidget({ davalar, icralar, gorevler, muvAdMap }: AktiviteWidgetProps) {
  const aktiviteler = useMemo(() => {
    const items: Array<{ icon: string; baslik: string; alt: string; tarih: string; ts: number }> = [];

    davalar?.forEach((d) => {
      if (d.tarih) items.push({ icon: '📁', baslik: `Dava açıldı: ${d.no || d.konu || '—'}`, alt: muvAdMap[d.muvId as string] || '', tarih: d.tarih as string, ts: new Date(d.tarih as string).getTime() });
      if (d.durusma && new Date(d.durusma as string).getTime() < Date.now()) {
        items.push({ icon: '📅', baslik: `Duruşma: ${d.no || d.konu || '—'}`, alt: muvAdMap[d.muvId as string] || '', tarih: d.durusma as string, ts: new Date(d.durusma as string).getTime() });
      }
      (d.tahsilatlar as Array<{ tutar: number; tarih?: string; tur?: string }> | undefined)?.forEach((t) => {
        if (t.tarih) items.push({ icon: '💰', baslik: `Tahsilat: ${fmt(t.tutar)}`, alt: `${d.no || d.konu || '—'} · ${t.tur || ''}`, tarih: t.tarih, ts: new Date(t.tarih).getTime() });
      });
    });

    icralar?.forEach((i) => {
      if (i.tarih) items.push({ icon: '⚡', baslik: `İcra başlatıldı: ${i.no || '—'}`, alt: muvAdMap[i.muvId as string] || '', tarih: i.tarih as string, ts: new Date(i.tarih as string).getTime() });
    });

    gorevler?.forEach((g) => {
      if (g.durum === 'Tamamlandı' && g.sonTarih) items.push({ icon: '✅', baslik: `Görev tamamlandı: ${g.baslik || '—'}`, alt: '', tarih: g.sonTarih as string, ts: new Date(g.sonTarih as string).getTime() });
    });

    return items.filter((i) => !isNaN(i.ts)).sort((a, b) => b.ts - a.ts).slice(0, 6);
  }, [davalar, icralar, gorevler, muvAdMap]);

  if (aktiviteler.length === 0) return <EmptyState icon="📋" text="Henüz aktivite yok" action="Müvekkil Ekle ›" actionHref="/muvekkillar?yeni=1" />;

  return (
    <div className="space-y-1 mt-1">
      {aktiviteler.map((a, i) => (
        <div key={i} className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface2/50 transition-colors">
          <span className="text-sm flex-shrink-0 mt-0.5">{a.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-text truncate">{a.baslik}</div>
            {a.alt && <div className="text-[10px] text-text-dim truncate">{a.alt}</div>}
          </div>
          <span className="text-[9px] text-text-dim flex-shrink-0 mt-0.5">{fmtTarih(a.tarih)}</span>
        </div>
      ))}
    </div>
  );
}
