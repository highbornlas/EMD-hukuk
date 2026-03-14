'use client';

import { EmptyState } from '../WidgetWrapper';

/* ══════════════════════════════════════════════════════════════
   Devam Eden Hizmetler Widget
   ══════════════════════════════════════════════════════════════ */

interface HizmetlerWidgetProps {
  danismanliklar: Array<Record<string, unknown>>;
  muvAdMap: Record<string, string>;
}

export function HizmetlerWidget({ danismanliklar, muvAdMap }: HizmetlerWidgetProps) {
  const devamEdenHizmetler = (danismanliklar || [])
    .filter((d) => d.durum === 'Aktif' || d.durum === 'Devam Ediyor' || d.durum === 'Taslak')
    .slice(0, 5);

  if (devamEdenHizmetler.length === 0) {
    return <EmptyState icon="⚖️" text="Aktif danışmanlık bulunmuyor" />;
  }

  return (
    <div className="space-y-1.5 mt-1">
      {devamEdenHizmetler.map((d) => (
        <div key={d.id as string} className="flex items-center gap-3 px-2 py-2 bg-surface2/50 rounded-lg hover:bg-surface2 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-text truncate">{(d.konu as string) || '—'}</div>
            <div className="text-[10px] text-text-dim truncate">{muvAdMap[(d.muvId as string) || ''] || '—'} · {(d.tur as string) || 'Danışmanlık'} / {String(d.altTur || '—')}</div>
          </div>
          <span className="badge badge-gold text-[9px]">{(d.durum as string) || 'Taslak'}</span>
        </div>
      ))}
    </div>
  );
}
