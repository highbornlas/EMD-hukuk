'use client';

import { useMemo } from 'react';
import { fmtTarih } from '@/lib/utils';
import { EmptyState } from '../WidgetWrapper';

/* ══════════════════════════════════════════════════════════════
   Görevler Widget — Bu hafta yapılacaklar
   ══════════════════════════════════════════════════════════════ */

interface GorevlerWidgetProps {
  gorevler: Array<Record<string, unknown>>;
}

export function GorevlerWidget({ gorevler }: GorevlerWidgetProps) {
  const buHaftaGorevler = useMemo(() => {
    if (!gorevler) return [];
    return gorevler
      .filter((g) => g.durum !== 'Tamamlandı' && g.durum !== 'İptal')
      .sort((a, b) => {
        if (a.oncelik === 'Yüksek' && b.oncelik !== 'Yüksek') return -1;
        if (b.oncelik === 'Yüksek' && a.oncelik !== 'Yüksek') return 1;
        return ((a.sonTarih as string) || '').localeCompare((b.sonTarih as string) || '');
      })
      .slice(0, 5);
  }, [gorevler]);

  if (buHaftaGorevler.length === 0) {
    return <EmptyState icon="✅" text="Görev bulunmuyor" />;
  }

  return (
    <div className="space-y-1.5 mt-1">
      {buHaftaGorevler.map((g) => (
        <div key={g.id as string} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${g.oncelik === 'Yüksek' ? 'bg-red-dim/30' : 'bg-surface2/50'}`}>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-text truncate">{(g.baslik as string) || '—'}</div>
            <div className="text-[10px] text-text-dim">{g.sonTarih ? fmtTarih(g.sonTarih as string) : ''}</div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${g.oncelik === 'Yüksek' ? 'bg-red text-white' : 'bg-gold-dim text-gold'}`}>
            {g.oncelik === 'Yüksek' ? 'Gecikti' : (g.oncelik as string) || ''}
          </span>
        </div>
      ))}
    </div>
  );
}
