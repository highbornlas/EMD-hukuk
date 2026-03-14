'use client';

import { useHavaDurumu } from '@/lib/hooks/useHavaDurumu';

/* ══════════════════════════════════════════════════════════════
   Hava Durumu Badge — Dashboard başlığında küçük inline gösterge
   Tıklanınca detay modal açar
   ══════════════════════════════════════════════════════════════ */

interface HavaDurumuBadgeProps {
  onClick: () => void;
}

export function HavaDurumuBadge({ onClick }: HavaDurumuBadgeProps) {
  const { data, isLoading, isError } = useHavaDurumu();

  // Hata veya yükleme durumunda gizle (graceful degradation)
  if (isError || (!isLoading && !data)) return null;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                 bg-surface2 border border-border hover:border-gold/30
                 hover:bg-surface2/80 transition-all duration-200 cursor-pointer group"
      title={data ? `${data.sehir} — ${data.mevcut.aciklama}` : 'Hava durumu yükleniyor...'}
    >
      {isLoading ? (
        /* Skeleton shimmer */
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-surface2 animate-pulse" />
          <div className="w-8 h-3 rounded bg-surface2 animate-pulse" />
        </div>
      ) : data ? (
        <>
          <span className="text-sm leading-none">{data.mevcut.ikon}</span>
          <span className="text-[12px] font-semibold text-text group-hover:text-gold transition-colors">
            {data.mevcut.sicaklik}°
          </span>
          <span className="hidden sm:inline text-[10px] text-text-dim">
            {data.sehir}
          </span>
        </>
      ) : null}
    </button>
  );
}
