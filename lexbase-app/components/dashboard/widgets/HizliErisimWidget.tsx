'use client';

import Link from 'next/link';
import { useSonErisim, type ErisimKayit } from '@/lib/hooks/useSonErisim';

/* ══════════════════════════════════════════════════════════════
   Hızlı Erişim Widget — Son açılan + sabitlenmiş dosyalar
   ══════════════════════════════════════════════════════════════ */

const TIP_IKON: Record<string, string> = {
  dava: '📁',
  icra: '⚡',
  muvekkil: '👤',
  danismanlik: '⚖️',
  arabuluculuk: '🤝',
  ihtarname: '📨',
};

const TIP_HREF: Record<string, string> = {
  dava: '/davalar/',
  icra: '/icra/',
  muvekkil: '/muvekkillar/',
  danismanlik: '/danismanlik/',
  arabuluculuk: '/arabuluculuk/',
  ihtarname: '/ihtarname/',
};

function zamanFarki(tarih: string): string {
  const fark = Date.now() - new Date(tarih).getTime();
  const dk = Math.floor(fark / 60000);
  if (dk < 1) return 'Az önce';
  if (dk < 60) return `${dk} dk`;
  const saat = Math.floor(dk / 60);
  if (saat < 24) return `${saat} saat`;
  const gun = Math.floor(saat / 24);
  return `${gun} gün`;
}

function DosyaSatir({ kayit, isSabitlenen, onToggle }: { kayit: ErisimKayit; isSabitlenen: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2 transition-colors group">
      <span className="text-sm flex-shrink-0">{TIP_IKON[kayit.tip] || '📄'}</span>
      <Link
        href={`${TIP_HREF[kayit.tip] || '/'}${kayit.id}`}
        className="flex-1 min-w-0"
      >
        <div className="text-[11px] font-medium text-text truncate">{kayit.baslik}</div>
        <div className="text-[9px] text-text-dim">{zamanFarki(kayit.tarih)}</div>
      </Link>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`text-[12px] flex-shrink-0 transition-colors ${isSabitlenen ? 'text-gold' : 'text-text-dim opacity-0 group-hover:opacity-100'}`}
        title={isSabitlenen ? 'Sabitlemeyi kaldır' : 'Sabitle'}
      >
        {isSabitlenen ? '⭐' : '☆'}
      </button>
    </div>
  );
}

export function HizliErisimWidget() {
  const { sonErisimler, sabitlenenler, toggleSabitle, isSabitlenen } = useSonErisim();

  const sabitlenenliste = sabitlenenler.slice(0, 5);
  const sonErisimFiltreli = sonErisimler
    .filter((e) => !sabitlenenler.some((s) => s.id === e.id))
    .slice(0, 5);

  if (sabitlenenliste.length === 0 && sonErisimFiltreli.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-5 text-center">
        <span className="text-2xl opacity-40 mb-2">⭐</span>
        <div className="text-[12px] text-text-dim">Henüz dosya erişimi yok</div>
        <div className="text-[10px] text-text-dim mt-0.5">Dosyalarınızı ziyaret ettikçe burada görünecek</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-1">
      {/* Sabitlenmiş */}
      {sabitlenenliste.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-gold uppercase tracking-wider mb-1 px-2">Sabitlenmiş</div>
          <div className="space-y-0.5">
            {sabitlenenliste.map((k) => (
              <DosyaSatir key={k.id} kayit={k} isSabitlenen={true} onToggle={() => toggleSabitle(k)} />
            ))}
          </div>
        </div>
      )}

      {/* Son Açılan */}
      {sonErisimFiltreli.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 px-2">Son Açılan</div>
          <div className="space-y-0.5">
            {sonErisimFiltreli.map((k) => (
              <DosyaSatir key={k.id} kayit={k} isSabitlenen={isSabitlenen(k.id)} onToggle={() => toggleSabitle(k)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
