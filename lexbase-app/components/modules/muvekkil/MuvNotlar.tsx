'use client';

import { useState } from 'react';
import type { Muvekkil } from '@/lib/hooks/useMuvekkillar';

interface Not {
  id: string;
  tarih: string;
  icerik: string;
}

interface Props {
  muv: Muvekkil;
  onKaydet: (guncellenen: Muvekkil) => void;
}

export function MuvNotlar({ muv, onKaydet }: Props) {
  const [ekleOpen, setEkleOpen] = useState(false);
  const [yeniNot, setYeniNot] = useState('');

  /* ── Notları al (eski string + yeni array uyumluluğu) ── */
  const notlar: Not[] = (() => {
    const arr = (muv as Record<string, unknown>).notlar as Not[] | undefined;
    if (arr && Array.isArray(arr)) return arr;
    // Eski tek string formatı → array'e dönüştür
    if (muv.not) {
      return [{ id: 'legacy', tarih: '', icerik: muv.not }];
    }
    return [];
  })();

  /* ── Not ekle ── */
  const handleEkle = () => {
    if (!yeniNot.trim()) return;
    const yeni: Not = {
      id: crypto.randomUUID(),
      tarih: new Date().toISOString().slice(0, 16).replace('T', ' '),
      icerik: yeniNot.trim(),
    };
    const guncel = [yeni, ...notlar.filter((n) => n.id !== 'legacy')];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { not: _eskiNot, ...rest } = muv as Record<string, unknown>;
    onKaydet({ ...rest, id: muv.id, ad: muv.ad, notlar: guncel } as Muvekkil);
    setYeniNot('');
    setEkleOpen(false);
  };

  /* ── Not sil ── */
  const handleSil = (silId: string) => {
    const guncel = notlar.filter((n) => n.id !== silId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { not: _eskiNot, ...rest } = muv as Record<string, unknown>;
    onKaydet({ ...rest, id: muv.id, ad: muv.ad, notlar: guncel } as Muvekkil);
  };

  return (
    <div className="space-y-4">
      {/* Başlık + Ekle Butonu */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">📝 Notlar ({notlar.length})</h3>
        <button
          onClick={() => setEkleOpen(!ekleOpen)}
          className="text-xs font-medium text-gold hover:text-gold-light transition-colors"
        >
          {ekleOpen ? '✕ İptal' : '+ Not Ekle'}
        </button>
      </div>

      {/* Hızlı Not Ekleme */}
      {ekleOpen && (
        <div className="bg-surface border border-gold/30 rounded-lg p-4">
          <textarea
            value={yeniNot}
            onChange={(e) => setYeniNot(e.target.value)}
            placeholder="Notunuzu yazın..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-text-dim focus:border-gold focus:outline-none resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => { setEkleOpen(false); setYeniNot(''); }}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-text transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleEkle}
              disabled={!yeniNot.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-gold text-bg rounded-lg hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Not Listesi */}
      {notlar.length === 0 ? (
        <div className="text-center py-10 text-text-muted bg-surface border border-border rounded-lg">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-sm font-medium">Henüz not eklenmemiş</div>
          <button
            onClick={() => setEkleOpen(true)}
            className="mt-3 px-4 py-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold-dim transition-colors"
          >
            + İlk Notu Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notlar.map((n) => (
            <div key={n.id} className="bg-surface border border-border rounded-lg p-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">{n.icerik}</div>
                  {n.tarih && (
                    <div className="text-[10px] text-text-dim mt-2">{n.tarih}</div>
                  )}
                </div>
                <button
                  onClick={() => handleSil(n.id)}
                  className="text-text-dim hover:text-red text-xs opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Notu sil"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
