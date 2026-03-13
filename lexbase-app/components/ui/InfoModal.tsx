'use client';

import { useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   InfoModal — Premium Bilgilendirme Modal
   Hukuki metinler, hakkımızda, sürüm notları vb. için
   kaydırılabilir, şık, dark-themed modal.
   - backdrop-blur + dark overlay
   - bg-[#131A2B] (lexbase-card)
   - max-h-[80vh] + overflow-y-auto
   - Premium scrollbar
   ══════════════════════════════════════════════════════════════ */

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function InfoModal({ open, onClose, title, children }: InfoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in-up"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-[95%] max-w-2xl bg-[#131A2B] border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(201,168,76,0.04)] animate-scale-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 info-modal-scroll">
          <div className="yasal-icerik">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 flex-shrink-0">
          <button onClick={onClose} className="btn-outline text-xs px-4 py-1.5">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
