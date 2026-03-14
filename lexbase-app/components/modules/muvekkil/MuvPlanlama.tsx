'use client';

import { useState, useMemo } from 'react';
import { useTodolar, useTodoKaydet } from '@/lib/hooks/useTodolar';
import { GorevModal } from '@/components/modules/GorevModal';

interface Props {
  muvId: string;
}

const DURUM_RENK: Record<string, string> = {
  'Bekliyor': 'text-gold bg-gold-dim border-gold/20',
  'Devam Ediyor': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Tamamlandı': 'text-green bg-green-dim border-green/20',
  'İptal': 'text-text-dim bg-surface2 border-border',
};

const ONCELIK_RENK: Record<string, string> = {
  'Yüksek': 'text-red bg-red-dim border-red/20',
  'Orta': 'text-gold bg-gold-dim border-gold/20',
  'Düşük': 'text-green bg-green-dim border-green/20',
};

export function MuvPlanlama({ muvId }: Props) {
  const { data: tumGorevler = [], isLoading } = useTodolar();
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Müvekkile ait görevler ── */
  const gorevler = useMemo(() =>
    tumGorevler.filter((g: Record<string, unknown>) => g.muvId === muvId),
    [tumGorevler, muvId]
  );

  /* ── Durum grupları ── */
  const bekleyen = gorevler.filter((g: Record<string, unknown>) => g.durum === 'Bekliyor' || !g.durum);
  const devamEden = gorevler.filter((g: Record<string, unknown>) => g.durum === 'Devam Ediyor');
  const tamamlanan = gorevler.filter((g: Record<string, unknown>) => g.durum === 'Tamamlandı');

  if (isLoading) {
    return <div className="text-center py-8 text-text-dim text-sm">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">📋 Planlama ({gorevler.length})</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-medium text-gold hover:text-gold-light transition-colors"
        >
          + Yeni Görev
        </button>
      </div>

      {gorevler.length === 0 ? (
        <div className="text-center py-10 text-text-muted bg-surface border border-border rounded-lg">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-sm font-medium">Henüz görev tanımlanmamış</div>
          <div className="text-xs text-text-dim mt-1">Bu müvekkil için yapılacak görevleri planlayın</div>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-3 px-4 py-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold-dim transition-colors"
          >
            + İlk Görevi Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Bekleyen */}
          {bekleyen.length > 0 && (
            <GorevGrubu baslik="Bekleyen" sayi={bekleyen.length} gorevler={bekleyen} />
          )}
          {/* Devam Eden */}
          {devamEden.length > 0 && (
            <GorevGrubu baslik="Devam Ediyor" sayi={devamEden.length} gorevler={devamEden} />
          )}
          {/* Tamamlanan */}
          {tamamlanan.length > 0 && (
            <GorevGrubu baslik="Tamamlandı" sayi={tamamlanan.length} gorevler={tamamlanan} />
          )}
        </div>
      )}

      {/* Görev Modal */}
      <GorevModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function GorevGrubu({ baslik, sayi, gorevler }: { baslik: string; sayi: number; gorevler: Record<string, unknown>[] }) {
  const bugun = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
        {baslik} ({sayi})
      </div>
      <div className="space-y-2">
        {gorevler.map((g) => {
          const gecikmi = g.sonTarih && (g.sonTarih as string) < bugun && g.durum !== 'Tamamlandı';
          return (
            <div
              key={g.id as string}
              className={`bg-surface border rounded-lg p-3.5 ${gecikmi ? 'border-red/40' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-text">{g.baslik as string}</div>
                  {g.aciklama ? <div className="text-xs text-text-muted mt-1">{g.aciklama as string}</div> : null}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {g.oncelik ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ONCELIK_RENK[g.oncelik as string] || ''}`}>
                      {g.oncelik as string}
                    </span>
                  ) : null}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DURUM_RENK[g.durum as string] || DURUM_RENK['Bekliyor']}`}>
                    {(g.durum as string) || 'Bekliyor'}
                  </span>
                </div>
              </div>
              {g.sonTarih ? (
                <div className={`text-[10px] mt-2 ${gecikmi ? 'text-red font-semibold' : 'text-text-dim'}`}>
                  {gecikmi ? '⚠ Gecikmiş: ' : 'Son tarih: '}{g.sonTarih as string}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
