'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SSS_DATA } from '@/lib/landing-data';

function FAQItem({ soru, cevap, open, onClick }: { soru: string; cevap: string; open: boolean; onClick: () => void }) {
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-colors duration-300">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
      >
        <span className="text-[15px] font-semibold text-white/80">{soru}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.04] flex items-center justify-center"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-0">
              <p className="text-sm text-white/40 leading-relaxed">{cevap}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(prev => prev === key ? null : key);
  };

  return (
    <div className="space-y-12">
      {SSS_DATA.map((kategori) => (
        <div key={kategori.kategori}>
          {/* Kategori başlığı */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]/60 whitespace-nowrap">{kategori.kategori}</span>
            <div className="h-px flex-1 bg-gradient-to-l from-[#D4AF37]/20 to-transparent" />
          </div>

          {/* Sorular */}
          <div className="space-y-3">
            {kategori.sorular.map((s, idx) => {
              const key = `${kategori.kategori}-${idx}`;
              return (
                <FAQItem
                  key={key}
                  soru={s.soru}
                  cevap={s.cevap}
                  open={openIndex === key}
                  onClick={() => toggle(key)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
