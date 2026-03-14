'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

/* ══════════════════════════════════════════════════════════════
   Hero Section — Tam ekran, fotoğraf arka plan + dönen başlık
   ══════════════════════════════════════════════════════════════ */

interface Headline {
  before: string;
  gold: string;
}

const HEADLINES: Headline[] = [
  { before: 'Hukuk Büronuzu ', gold: 'Dijitale Taşıyın.' },
  { before: 'Sadece Avukatlık Yapın, Ofis Yükünüzü ', gold: "LexBase'e Bırakın." },
  { before: 'Stresten Kurtulun, ', gold: 'LexBase Sizin için Süreleri Takip Eder.' },
  { before: 'Masraf ve Hakedişlerinizi ', gold: 'Tek Tuşla Yönetin.' },
  { before: 'Geleceğin Hukuk Bürosunu ', gold: 'Bugünden İnşa Edin.' },
];

const ROTATION_INTERVAL = 15000; // 15 saniye

/* ── Animasyon varyantları ── */
const headlineVariants = {
  enter: { opacity: 0, y: 32, filter: 'blur(6px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -28, filter: 'blur(4px)' },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/* ── Shimmer badge keyframes ── */
const shimmerKeyframes = `
@keyframes shimmer-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

interface HeroProps {
  onOpenAuth: (tab: 'giris' | 'kayit') => void;
}

export function Hero({ onOpenAuth }: HeroProps) {
  const [index, setIndex] = useState(0);

  const nextHeadline = useCallback(() => {
    setIndex((prev) => (prev + 1) % HEADLINES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextHeadline, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [nextHeadline]);

  return (
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden">
      {/* ── Shimmer CSS ── */}
      <style>{shimmerKeyframes}</style>

      {/* ════════════════════════════════════════════════════
          ARKA PLAN GÖRSELİ
          ════════════════════════════════════════════════════ */}
      <Image
        src="/hero-bg.jpg"
        alt="LexBase — Hukuk bürosu yönetim sistemi"
        fill
        priority
        className="object-cover object-[70%_center] lg:object-[65%_center]"
        sizes="100vw"
      />

      {/* ── Gradient Maskeler ── */}
      {/* Desktop: Sol → Sağ gradient (metin okunabilirliği) */}
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-black/[0.88] via-black/50 to-transparent" />

      {/* Mobil: Üstten alta gradient overlay */}
      <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-black/70 via-black/55 to-black/70" />

      {/* Alt kenar fade — tüm boyutlarda */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* ════════════════════════════════════════════════════
          İÇERİK — Sol taraf
          ════════════════════════════════════════════════════ */}
      <div className="relative z-10 h-full flex items-center pt-[72px]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12">
          <div className="max-w-xl sm:max-w-2xl lg:max-w-[55%] xl:max-w-[50%]">

            {/* ── 1. Badge ── */}
            <motion.div {...stagger(0.2)}>
              <div className="relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/[0.08] backdrop-blur-sm mb-6 sm:mb-8 overflow-hidden">
                {/* Shimmer efekti */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
                    animation: 'shimmer-slide 3s infinite',
                  }}
                />
                <span className="relative text-[12px] sm:text-[13px] text-[#E8C64A] font-medium tracking-wide">
                  ✨ Hukuk Bürolarının Yeni İşletim Sistemi
                </span>
              </div>
            </motion.div>

            {/* ── 2. Dönen Başlık (Rotating Headline) — Vurucu kısım gold ── */}
            <motion.div {...stagger(0.4)}>
              <div className="relative min-h-[5rem] sm:min-h-[6.5rem] md:min-h-[7.5rem] lg:min-h-[9rem] mb-5 sm:mb-7">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={index}
                    variants={headlineVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="font-[var(--font-playfair)] text-[1.8rem] sm:text-[2.4rem] md:text-[3rem] lg:text-[3.6rem] xl:text-[4rem] font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
                  >
                    {HEADLINES[index].before}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C64A]">
                      {HEADLINES[index].gold}
                    </span>
                  </motion.h1>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── 3. Açıklama ── */}
            <motion.p
              {...stagger(0.6)}
              className="text-[14px] sm:text-[15px] md:text-base lg:text-lg text-white/65 leading-relaxed mb-8 sm:mb-10 max-w-lg lg:max-w-xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
            >
              Siz sadece adalete odaklanın, büro yönetimini LexBase&apos;e bırakın.
              Excel karmaşasına ve kaçan sürelere veda edin; davalarınızdan
              finansal süreçlerinize kadar her şey güvenle kontrol altında.
            </motion.p>

            {/* ── 4. CTA Butonları ── */}
            <motion.div {...stagger(0.8)} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Ana CTA — Ücretsiz Deneyin */}
              <button
                onClick={() => onOpenAuth('kayit')}
                className="group relative px-7 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] text-[15px] sm:text-base font-bold rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:shadow-[0_0_60px_rgba(212,175,55,0.4)] transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
              >
                Ücretsiz Deneyin
                <span className="inline-block ml-2 group-hover:translate-x-1.5 transition-transform duration-300">
                  →
                </span>
              </button>

              {/* İkincil CTA — Keşfet (Outline) */}
              <a
                href="#ozellikler"
                className="group relative px-7 sm:px-10 py-3.5 sm:py-4 border border-white/20 text-white/80 text-[15px] sm:text-base font-semibold rounded-xl backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/30 hover:text-white transition-all duration-300"
              >
                Keşfet
                <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  ↓
                </span>
              </a>
            </motion.div>

            {/* ── İstatistikler ── */}
            <motion.div
              {...stagger(1.0)}
              className="flex items-center gap-6 sm:gap-8 md:gap-10 mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/[0.08]"
            >
              {[
                { value: '12+', label: 'Modül' },
                { value: '100%', label: 'Veri Güvenliği' },
                { value: '30', label: 'Gün Ücretsiz' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-[var(--font-playfair)] text-xl sm:text-2xl md:text-3xl text-[#D4AF37] font-bold">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-white/30 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          SCROLL GÖSTERGESİ
          ════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <a href="#sosyal-kanit" className="block">
          <div className="w-6 h-10 border-2 border-white/15 rounded-full flex items-start justify-center p-1.5 hover:border-white/25 transition-colors">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"
            />
          </div>
        </a>
      </motion.div>
    </section>
  );
}
