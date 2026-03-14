'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KARSILASTIRMA_DATA, type KarsilastirmaSatir } from '@/lib/landing-data';

const PLAN_NAMES = ['Başlangıç', 'Profesyonel', 'Büro', 'Kurumsal'] as const;
const PLAN_KEYS = ['baslangic', 'profesyonel', 'buro', 'kurumsal'] as const;

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-white/50 text-xs font-medium">{value}</span>;
  }
  return value
    ? <span className="text-[#D4AF37] text-sm">✓</span>
    : <span className="text-white/10 text-sm">✗</span>;
}

/* ── Desktop Tablo ── */
function DesktopTable({ kategoriler }: { kategoriler: Record<string, KarsilastirmaSatir[]> }) {
  return (
    <div className="hidden lg:block overflow-hidden rounded-2xl border border-white/[0.06]">
      {/* Header */}
      <div className="grid grid-cols-[1fr_repeat(4,120px)] bg-white/[0.03]">
        <div className="px-5 py-4 text-xs text-white/30 uppercase tracking-wider font-medium">Özellik</div>
        {PLAN_NAMES.map((p, i) => (
          <div key={p} className={`px-4 py-4 text-center text-xs font-bold ${i === 2 ? 'text-[#D4AF37]' : 'text-white/60'}`}>
            {p}
          </div>
        ))}
      </div>

      {Object.entries(kategoriler).map(([kat, satirlar]) => (
        <div key={kat}>
          {/* Kategori başlık */}
          <div className="px-5 py-3 bg-[#D4AF37]/[0.03] border-y border-white/[0.04]">
            <span className="text-[11px] font-bold text-[#D4AF37]/70 uppercase tracking-[0.15em]">{kat}</span>
          </div>
          {/* Satırlar */}
          {satirlar.map((s, idx) => (
            <div key={s.ozellik} className={`grid grid-cols-[1fr_repeat(4,120px)] ${idx < satirlar.length - 1 ? 'border-b border-white/[0.03]' : ''}`}>
              <div className="px-5 py-3 text-sm text-white/45">{s.ozellik}</div>
              {PLAN_KEYS.map((k, i) => (
                <div key={k} className={`px-4 py-3 text-center ${i === 2 ? 'bg-[#D4AF37]/[0.02]' : ''}`}>
                  <CellValue value={s[k]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Mobil Accordion ── */
function MobileAccordion({ kategoriler }: { kategoriler: Record<string, KarsilastirmaSatir[]> }) {
  const [openPlan, setOpenPlan] = useState<number | null>(2); // Büro default açık

  return (
    <div className="lg:hidden space-y-3">
      {PLAN_NAMES.map((plan, pi) => {
        const isOpen = openPlan === pi;
        return (
          <div key={plan} className={`rounded-xl border overflow-hidden transition-colors duration-300 ${isOpen ? 'border-[#D4AF37]/20 bg-[#D4AF37]/[0.02]' : 'border-white/[0.06]'}`}>
            <button
              onClick={() => setOpenPlan(isOpen ? null : pi)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
            >
              <span className={`text-sm font-bold ${pi === 2 ? 'text-[#D4AF37]' : 'text-white/70'}`}>{plan}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-white/30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 space-y-4">
                    {Object.entries(kategoriler).map(([kat, satirlar]) => (
                      <div key={kat}>
                        <div className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-[0.15em] mb-2">{kat}</div>
                        <div className="space-y-1.5">
                          {satirlar.map(s => (
                            <div key={s.ozellik} className="flex items-center justify-between">
                              <span className="text-xs text-white/35">{s.ozellik}</span>
                              <CellValue value={s[PLAN_KEYS[pi]]} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ── Ana Bileşen ── */
export function PricingComparison() {
  const [expanded, setExpanded] = useState(false);

  // Kategorilere ayır
  const kategoriler: Record<string, KarsilastirmaSatir[]> = {};
  KARSILASTIRMA_DATA.forEach(s => {
    if (!kategoriler[s.kategori]) kategoriler[s.kategori] = [];
    kategoriler[s.kategori].push(s);
  });

  return (
    <div className="mt-16">
      {/* Toggle */}
      <div className="text-center mb-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/40 border border-white/[0.08] rounded-xl hover:text-[#D4AF37] hover:border-[#D4AF37]/20 transition-all duration-300 cursor-pointer"
        >
          {expanded ? 'Karşılaştırmayı Gizle' : 'Tüm Özellikleri Karşılaştır'}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
          </motion.span>
        </button>
      </div>

      {/* Tablo */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <DesktopTable kategoriler={kategoriler} />
            <MobileAccordion kategoriler={kategoriler} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
