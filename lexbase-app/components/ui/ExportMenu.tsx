'use client';

import { useState, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════
   Export Menu — PDF / Excel dropdown buton
   ══════════════════════════════════════════════════════════════ */

interface Props {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  disabled?: boolean;
}

export function ExportMenu({ onExportPDF, onExportExcel, disabled }: Props) {
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
        disabled={disabled}
        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
          disabled
            ? 'bg-surface2 text-text-dim border-border cursor-not-allowed'
            : 'bg-surface border-border text-text-muted hover:border-gold/40 hover:text-text'
        }`}
      >
        📥 Dışa Aktar
      </button>

      {open && (
        <div className="dropdown-menu absolute right-0 top-full mt-1 w-44 py-1 z-50 animate-fade-in-up">
          {onExportPDF && (
            <button
              onClick={() => { onExportPDF(); setOpen(false); }}
              className="dropdown-item w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text text-left"
            >
              📄 PDF olarak indir
            </button>
          )}
          {onExportExcel && (
            <button
              onClick={() => { onExportExcel(); setOpen(false); }}
              className="dropdown-item w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text text-left"
            >
              📊 Excel olarak indir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
