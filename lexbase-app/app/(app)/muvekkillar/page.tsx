'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMuvekkillar } from '@/lib/hooks/useMuvekkillar';

export default function MuvekkillarPage() {
  const { data: muvekkillar, isLoading } = useMuvekkillar();
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'hepsi' | 'gercek' | 'tuzel'>('hepsi');

  const filtrelenmis = useMemo(() => {
    if (!muvekkillar) return [];
    return muvekkillar.filter((m) => {
      // Tip filtresi
      if (filtre === 'gercek' && m.tip === 'tuzel') return false;
      if (filtre === 'tuzel' && m.tip !== 'tuzel') return false;
      // Arama
      if (arama) {
        const q = arama.toLowerCase();
        return (
          (m.ad || '').toLowerCase().includes(q) ||
          (m.tc || '').includes(q) ||
          (m.tel || '').includes(q) ||
          (m.mail || '').toLowerCase().includes(q) ||
          (m.vergiNo || '').includes(q)
        );
      }
      return true;
    });
  }, [muvekkillar, arama, filtre]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold">
          Müvekkiller
          {muvekkillar && (
            <span className="text-sm font-normal text-text-muted ml-2">
              ({muvekkillar.length})
            </span>
          )}
        </h1>
        <button className="px-4 py-2 bg-gold text-bg font-semibold rounded-lg text-xs hover:bg-gold-light transition-colors">
          + Yeni Müvekkil
        </button>
      </div>

      {/* Arama + Filtre */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Ad, TC, telefon, e-posta ile ara..."
            className="w-full px-4 py-2.5 pl-9 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-sm">🔍</span>
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['hepsi', 'gercek', 'tuzel'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filtre === f
                  ? 'bg-gold text-bg'
                  : 'bg-surface text-text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              {f === 'hepsi' ? 'Tümü' : f === 'gercek' ? 'Gerçek Kişi' : 'Tüzel Kişi'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-12 text-text-muted text-sm">Yükleniyor...</div>
      ) : filtrelenmis.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-lg">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-sm text-text-muted">
            {arama ? 'Arama sonucu bulunamadı' : 'Henüz müvekkil eklenmemiş'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrelenmis.map((m) => (
            <Link
              key={m.id}
              href={`/muvekkillar/${m.id}`}
              className="flex items-center gap-4 bg-surface border border-border rounded-lg p-4 hover:border-gold hover:bg-gold-dim transition-all group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gold-dim border border-gold flex items-center justify-center text-gold text-sm font-bold flex-shrink-0">
                {m.ad?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Bilgi */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text group-hover:text-gold transition-colors truncate">
                    {m.ad}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    m.tip === 'tuzel'
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-green bg-green-dim'
                  }`}>
                    {m.tip === 'tuzel' ? 'TÜZEL' : 'GERÇEK'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
                  {m.tc && <span>TC: {m.tc}</span>}
                  {m.vergiNo && <span>VKN: {m.vergiNo}</span>}
                  {m.tel && <span>📞 {m.tel}</span>}
                  {m.mail && <span>✉️ {m.mail}</span>}
                </div>
              </div>

              {/* Ok */}
              <span className="text-text-dim group-hover:text-gold transition-colors text-lg">
                ›
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
