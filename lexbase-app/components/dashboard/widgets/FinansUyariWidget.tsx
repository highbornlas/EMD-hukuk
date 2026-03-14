'use client';

import { fmt } from '@/lib/utils';
import { EmptyState } from '../WidgetWrapper';

/* ══════════════════════════════════════════════════════════════
   Finansal Uyarılar Widget
   ══════════════════════════════════════════════════════════════ */

interface FinansUyariWidgetProps {
  uyarilar: Array<Record<string, unknown>>;
}

export function FinansUyariWidget({ uyarilar }: FinansUyariWidgetProps) {
  const uyariSayi = Array.isArray(uyarilar) ? uyarilar.length : 0;
  const kritikUyari = Array.isArray(uyarilar) ? uyarilar.filter((u) => u.oncelik === 'yuksek').length : 0;

  if (uyariSayi === 0) {
    return <EmptyState icon="✅" text="Finansal uyarı bulunmuyor" />;
  }

  return (
    <div className="mt-1 space-y-2">
      {/* Özet */}
      <div className="bg-surface2 rounded-xl p-3 text-center">
        <div className="progress-bar mb-2">
          <div className="progress-fill" style={{ width: `${Math.min(100, kritikUyari * 25)}%`, background: kritikUyari > 0 ? 'var(--red)' : 'var(--gradient-progress)' }} />
        </div>
        <div className={`font-[var(--font-playfair)] text-xl font-bold ${kritikUyari > 0 ? 'text-red' : 'text-gold'}`}>{kritikUyari} Kritik</div>
        <div className="text-[10px] text-text-dim">{uyariSayi} toplam uyarı</div>
      </div>
      {/* Liste */}
      {uyarilar.slice(0, 4).map((u, i) => (
        <div key={i} className={`flex items-start gap-2 px-2 py-2 rounded-lg text-[11px] ${u.oncelik === 'yuksek' ? 'bg-red-dim/40 text-red' : 'bg-gold-dim/30 text-gold'}`}>
          <span className="flex-shrink-0 mt-0.5">{(u.icon as string) || '⚠️'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium leading-snug">{u.mesaj as string}</div>
            {typeof u.tutar === 'number' && u.tutar > 0 && (
              <div className="font-bold mt-0.5">{fmt(u.tutar)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
