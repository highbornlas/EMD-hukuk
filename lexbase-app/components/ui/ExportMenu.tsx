'use client';

import { useState, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════
   Veri Aktarım Menüsü — Dışa Aktar (PDF/Excel) + İçe Aktar (CSV)
   Tek dropdown buton
   ══════════════════════════════════════════════════════════════ */

interface Props {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onImportCSV?: () => void;
  disabled?: boolean;
}

export function ExportMenu({ onExportPDF, onExportExcel, onImportCSV, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 bg-surface border-border text-text-muted hover:border-gold/40 hover:text-text"
      >
        📦 Aktar
      </button>

      {open && (
        <div className="dropdown-menu absolute right-0 top-full mt-1 w-48 py-1 z-50 animate-fade-in-up">
          {/* Dışa Aktar bölümü */}
          <div className="px-3 py-1.5 text-[10px] font-semibold text-text-dim uppercase tracking-wider">Dışa Aktar</div>
          {onExportPDF && (
            <button
              onClick={() => { onExportPDF(); setOpen(false); }}
              disabled={disabled}
              className="dropdown-item w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              📄 PDF olarak indir
            </button>
          )}
          {onExportExcel && (
            <button
              onClick={() => { onExportExcel(); setOpen(false); }}
              disabled={disabled}
              className="dropdown-item w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              📊 Excel olarak indir
            </button>
          )}

          {/* Ayırıcı */}
          {onImportCSV && (
            <>
              <div className="border-t border-border/50 my-1" />
              <div className="px-3 py-1.5 text-[10px] font-semibold text-text-dim uppercase tracking-wider">İçe Aktar</div>
              <button
                onClick={() => { onImportCSV(); setOpen(false); }}
                className="dropdown-item w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text text-left"
              >
                📥 CSV dosyasından
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
