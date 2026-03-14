'use client';

import { useState, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════
   Etiket Seçici — Müvekkil, Karşı Taraf, Avukat için ortak
   Mevcut etiketleri gösterir, yeni etiket ekler, tıkla/sil
   ══════════════════════════════════════════════════════════════ */

// Ön tanımlı etiketler (kullanıcı bunları seçebilir veya kendi etiketini yazabilir)
export const ON_TANIMLI_ETIKETLER = [
  'VIP', 'Aktif', 'Pasif', 'Potansiyel', 'Kurumsal',
  'Bireysel', 'Düzenli', 'Yeni', 'Eski', 'Borçlu',
];

const ETIKET_RENKLER: Record<string, string> = {
  'VIP': 'bg-gold/15 text-gold border-gold/30',
  'Aktif': 'bg-green/15 text-green border-green/30',
  'Pasif': 'bg-text-dim/15 text-text-dim border-text-dim/30',
  'Potansiyel': 'bg-blue-400/15 text-blue-400 border-blue-400/30',
  'Kurumsal': 'bg-purple-400/15 text-purple-400 border-purple-400/30',
  'Bireysel': 'bg-sky-400/15 text-sky-400 border-sky-400/30',
  'Borçlu': 'bg-red/15 text-red border-red/30',
};

const VARSAYILAN_RENK = 'bg-surface2 text-text-muted border-border';

interface EtiketSeciciProps {
  etiketler: string[];
  onChange: (etiketler: string[]) => void;
  /** Bürodaki tüm kullanılmış etiketleri önermek için */
  mevcutEtiketler?: string[];
}

export function EtiketSecici({ etiketler, onChange, mevcutEtiketler = [] }: EtiketSeciciProps) {
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    if (acik) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [acik]);

  // Tüm benzersiz öneriler: ön tanımlı + bürodaki mevcut etiketler
  const tumOneriler = Array.from(new Set([...ON_TANIMLI_ETIKETLER, ...mevcutEtiketler]));
  const filtrelenmis = tumOneriler
    .filter((e) => !etiketler.includes(e))
    .filter((e) => !arama || e.toLowerCase().includes(arama.toLowerCase()));

  function ekle(etiket: string) {
    const temiz = etiket.trim();
    if (temiz && !etiketler.includes(temiz)) {
      onChange([...etiketler, temiz]);
    }
    setArama('');
  }

  function kaldir(etiket: string) {
    onChange(etiketler.filter((e) => e !== etiket));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && arama.trim()) {
      e.preventDefault();
      ekle(arama);
    }
    if (e.key === 'Backspace' && !arama && etiketler.length > 0) {
      kaldir(etiketler[etiketler.length - 1]);
    }
    if (e.key === 'Escape') {
      setAcik(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Etiketler</div>

      {/* Seçili etiketler + input */}
      <div
        className="flex flex-wrap items-center gap-1.5 px-2.5 py-2 rounded-[10px] bg-surface border border-border cursor-text min-h-[38px]"
        onClick={() => { setAcik(true); inputRef.current?.focus(); }}
      >
        {etiketler.map((e) => (
          <span
            key={e}
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${ETIKET_RENKLER[e] || VARSAYILAN_RENK}`}
          >
            {e}
            <button
              type="button"
              onClick={(ev) => { ev.stopPropagation(); kaldir(e); }}
              className="hover:opacity-70 text-current"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={arama}
          onChange={(ev) => { setArama(ev.target.value); setAcik(true); }}
          onFocus={() => setAcik(true)}
          onKeyDown={handleKeyDown}
          placeholder={etiketler.length === 0 ? 'Etiket ekle...' : ''}
          className="flex-1 min-w-[80px] bg-transparent text-xs text-text outline-none placeholder:text-text-dim"
        />
      </div>

      {/* Dropdown */}
      {acik && filtrelenmis.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-[10px] shadow-lg max-h-40 overflow-y-auto">
          {filtrelenmis.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => { ekle(e); inputRef.current?.focus(); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface2 transition-colors flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${ETIKET_RENKLER[e] ? ETIKET_RENKLER[e].split(' ')[0] : 'bg-text-dim/30'}`} />
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Etiket Badge (salt okunur, listede göstermek için) ── */
export function EtiketBadge({ etiket }: { etiket: string }) {
  return (
    <span className={`inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${ETIKET_RENKLER[etiket] || VARSAYILAN_RENK}`}>
      {etiket}
    </span>
  );
}
