'use client';

import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════
   Bulk Action Bar — Seçili kayıtlar için aksiyonlar
   ══════════════════════════════════════════════════════════════ */

interface Props {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  onDelete?: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  deleting?: boolean;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  allSelected,
  onToggleAll,
  onClear,
  onDelete,
  onExportPDF,
  onExportExcel,
  deleting,
}: Props) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-gold/30 rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4"
        >
          {/* Seçili sayı */}
          <div className="text-sm font-semibold text-text">
            <span className="text-gold">{selectedCount}</span>
            <span className="text-text-muted"> / {totalCount} seçili</span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border" />

          {/* Tümünü Seç / Temizle */}
          <button
            onClick={onToggleAll}
            className="px-3 py-1.5 text-xs font-medium text-text-muted border border-border rounded-lg hover:border-gold/40 hover:text-text transition-colors"
          >
            {allSelected ? 'Seçimi Temizle' : 'Tümünü Seç'}
          </button>

          {/* Export Butonları */}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="px-3 py-1.5 text-xs font-medium text-text-muted border border-border rounded-lg hover:border-gold/40 hover:text-text transition-colors"
            >
              PDF
            </button>
          )}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 text-xs font-medium text-text-muted border border-border rounded-lg hover:border-gold/40 hover:text-text transition-colors"
            >
              Excel
            </button>
          )}

          {/* Toplu Sil */}
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-semibold text-red border border-red/30 rounded-lg hover:bg-red/10 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Siliniyor...' : 'Toplu Sil'}
            </button>
          )}

          {/* Kapat */}
          <button
            onClick={onClear}
            className="w-7 h-7 flex items-center justify-center rounded-full text-text-dim hover:text-text hover:bg-surface2 transition-colors text-xs"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
