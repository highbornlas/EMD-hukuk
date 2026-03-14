'use client';

import { motion } from 'framer-motion';

export type PricingPeriod = 'aylik' | 'yillik';

interface PricingToggleProps {
  period: PricingPeriod;
  onChange: (p: PricingPeriod) => void;
}

export function PricingToggle({ period, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`text-sm font-medium transition-colors duration-300 ${period === 'aylik' ? 'text-white' : 'text-white/30'}`}>
        Aylık
      </span>

      {/* Toggle switch */}
      <button
        onClick={() => onChange(period === 'aylik' ? 'yillik' : 'aylik')}
        className="relative w-14 h-7 bg-white/[0.06] border border-white/[0.1] rounded-full cursor-pointer hover:border-[#D4AF37]/30 transition-colors duration-300"
        aria-label="Fiyat dönemi değiştir"
      >
        <motion.div
          animate={{ x: period === 'yillik' ? 28 : 2 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[3px] w-5 h-5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] shadow-[0_0_10px_rgba(212,175,55,0.3)]"
        />
      </button>

      <span className={`text-sm font-medium transition-colors duration-300 flex items-center gap-2 ${period === 'yillik' ? 'text-white' : 'text-white/30'}`}>
        Yıllık
        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 rounded-full">
          %20 indirim
        </span>
      </span>
    </div>
  );
}
