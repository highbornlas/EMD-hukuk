'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { EmptyState, GunBadge } from '../WidgetWrapper';
import { useTumEtkinlikler, TUR_IKON, type Etkinlik } from '@/lib/hooks/useEtkinlikler';

/* ══════════════════════════════════════════════════════════════
   Gündem Widget — Tüm modüllerden yaklaşan etkinlikler
   Dava duruşmaları, görev son tarihleri, icra itiraz süreleri,
   arabuluculuk oturumları, ihtarname süreleri, danışmanlık teslimleri
   + manuel takvim etkinlikleri
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
  sanal?: boolean;
  adliTatilUzama?: string;
}

export function GundemWidget({ muvAdMap }: GundemWidgetProps) {
  // useTumEtkinlikler hook'u tüm modüllerden sanal etkinlikleri de çeker
  const tumEtkinlikler = useTumEtkinlikler();

  const gundem = useMemo(() => {
    const items: GundemItem[] = [];
    const bugun = new Date();
    const sinir = new Date(bugun);
    sinir.setDate(bugun.getDate() + 14);
    const bugunMs = bugun.getTime();
    const sinirMs = sinir.getTime();

    for (const e of tumEtkinlikler) {
      if (!e.tarih) continue;
      // Uzamış kopyaları atla (orijinali zaten gösteriliyor)
      if (e.id.endsWith('-uzama')) continue;

      const t = new Date(e.tarih);
      if (t.getTime() >= bugunMs - 86400000 && t.getTime() <= sinirMs) {
        const gun = Math.ceil((t.getTime() - bugunMs) / 86400000);
        const muvAd = e.muvId ? muvAdMap[e.muvId] || '' : '';
        const tur = e.tur || 'Etkinlik';
        const icon = TUR_IKON[tur] || '📌';
        const link = e.kaynakUrl || '/takvim';

        items.push({
          id: e.id,
          baslik: e.baslik || '—',
          alt: `${tur}${e.saat ? ` · ${e.saat}` : ''}${muvAd ? ` · ${muvAd}` : ''}`,
          tarih: e.tarih,
          gun,
          icon,
          link,
          sanal: e.sanal,
          adliTatilUzama: e.adliTatilUzama,
        });
      }
    }

    return items.sort((a, b) => a.gun - b.gun).slice(0, 8);
  }, [tumEtkinlikler, muvAdMap]);

  if (gundem.length === 0) {
    return <EmptyState icon="📅" text="Gündemde etkinlik yok" action="Ekle ›" actionHref="/takvim?yeni=1" />;
  }

  return (
    <div className="space-y-1.5 mt-1">
      {gundem.map((item) => (
        <Link key={item.id} href={item.link} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface2 transition-colors group">
          <span className="text-sm flex-shrink-0">{item.icon}</span>
          <GunBadge gun={item.gun} />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-text truncate">
              {item.baslik}
              {item.sanal && <span className="ml-1 text-[8px] text-blue-400 opacity-60">oto</span>}
            </div>
            <div className="text-[11px] text-text-dim truncate">{item.alt}</div>
            {item.adliTatilUzama && (
              <div className="text-[9px] text-amber-500 truncate">⚠️ Süre {item.adliTatilUzama} tarihine uzar</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
