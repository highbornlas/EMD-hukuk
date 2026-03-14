'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { EmptyState, GunBadge } from '../WidgetWrapper';

/* ══════════════════════════════════════════════════════════════
   Gündem Widget — Yaklaşan duruşmalar + takvim etkinlikleri
   ══════════════════════════════════════════════════════════════ */

interface GundemWidgetProps {
  davalar: Array<Record<string, unknown>>;
  etkinlikler: Array<Record<string, unknown>>;
  muvAdMap: Record<string, string>;
}

interface GundemItem {
  id: string;
  baslik: string;
  alt: string;
  tarih: string;
  gun: number;
  icon: string;
  link: string;
}

export function GundemWidget({ davalar, etkinlikler, muvAdMap }: GundemWidgetProps) {
  const gundem = useMemo(() => {
    const items: GundemItem[] = [];
    const bugun = new Date();
    const sinir = new Date(bugun);
    sinir.setDate(bugun.getDate() + 14);

    // Duruşmalar
    davalar?.forEach((d) => {
      if (!d.durusma) return;
      const t = new Date(d.durusma as string);
      if (t >= bugun && t <= sinir) {
        const gun = Math.ceil((t.getTime() - bugun.getTime()) / 86400000);
        items.push({
          id: `dava-${d.id}`,
          baslik: (d.no || d.konu || '—') as string,
          alt: muvAdMap[(d.muvId as string) || ''] || '—',
          tarih: d.durusma as string,
          gun,
          icon: '📅',
          link: `/davalar/${d.id}`,
        });
      }
    });

    // Takvim etkinlikleri
    etkinlikler?.forEach((e) => {
      if (!e.tarih) return;
      const t = new Date(e.tarih as string);
      if (t >= bugun && t <= sinir) {
        const gun = Math.ceil((t.getTime() - bugun.getTime()) / 86400000);
        items.push({
          id: `etk-${e.id}`,
          baslik: (e.baslik || '—') as string,
          alt: `${(e.tur || 'Etkinlik') as string}${e.saat ? ` · ${e.saat}` : ''}`,
          tarih: e.tarih as string,
          gun,
          icon: '📌',
          link: '/takvim',
        });
      }
    });

    return items.sort((a, b) => a.gun - b.gun).slice(0, 6);
  }, [davalar, etkinlikler, muvAdMap]);

  if (gundem.length === 0) {
    return <EmptyState icon="📅" text="Gündemde etkinlik yok" action="Ekle ›" actionHref="/takvim?yeni=1" />;
  }

  return (
    <div className="space-y-1.5 mt-1">
      {gundem.map((item) => (
        <Link key={item.id} href={item.link} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface2 transition-colors">
          <span className="text-sm flex-shrink-0">{item.icon}</span>
          <GunBadge gun={item.gun} />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-text truncate">{item.baslik}</div>
            <div className="text-[11px] text-text-dim truncate">{item.alt}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
