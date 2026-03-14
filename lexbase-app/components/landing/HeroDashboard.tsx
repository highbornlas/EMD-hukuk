'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

/* ── Animated Counter ── */
function AnimCounter({ target, prefix = '', suffix = '', duration = 1.5 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(count, target, { duration, ease: [0.22, 1, 0.36, 1] });
    const unsub = rounded.on('change', v => setDisplay(String(v)));
    return () => { ctrl.stop(); unsub(); };
  }, [inView, target, count, rounded, duration]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ── Animated Row ── */
function AnimRow({ row, delay }: { row: { no: string; ad: string; tarih: string; durum: string; cls: string }; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 15 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-4 gap-2 text-[8px] px-3 py-2 border-b border-white/[0.03] last:border-0"
    >
      <span className="text-white/20">{row.no}</span>
      <span className="text-white/40">{row.ad}</span>
      <span className="text-white/25">{row.tarih}</span>
      <span><span className={`px-1.5 py-0.5 rounded text-[7px] ${row.cls}`}>{row.durum}</span></span>
    </motion.div>
  );
}

/* ── SVG Mini Chart ── */
function MiniChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const bars = [35, 52, 28, 65, 48, 72, 40];

  return (
    <div ref={ref} className="flex items-end gap-[3px] h-8 mt-2">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={inView ? { height: `${h}%` } : {}}
          transition={{ duration: 0.6, delay: 0.8 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 bg-[#D4AF37]/20 rounded-t-sm"
        />
      ))}
    </div>
  );
}

/* ── Ana Dashboard ── */
export function HeroDashboard() {
  const rows = [
    { no: '2026/1247', ad: 'K. Yılmaz', tarih: '15.04', durum: 'Aktif', cls: 'bg-emerald-500/20 text-emerald-400' },
    { no: '2026/0934', ad: 'Altın Yapı', tarih: '22.04', durum: 'Bekleme', cls: 'bg-[#D4AF37]/20 text-[#D4AF37]' },
    { no: '2025/2108', ad: 'L. Sönmez', tarih: '—', durum: 'Kapandı', cls: 'bg-red-500/20 text-red-400' },
  ];

  const kpis = [
    { v: 148, l: 'Aktif Dava', c: '#D4AF37', prefix: '' },
    { v: 284, l: 'Gelir', c: '#2ecc71', prefix: '₺', suffix: 'K' },
    { v: 27, l: 'Müvekkil', c: '#fff', prefix: '' },
    { v: 5, l: 'Kritik', c: '#e74c3c', prefix: '' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_60px_140px_rgba(0,0,0,0.6),0_0_60px_rgba(212,175,55,0.04)]">
      {/* Browser chrome */}
      <div className="bg-[#131820] px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e74c3c]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f39c12]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2ecc71]/70" />
        </div>
        <div className="flex-1 text-center text-[10px] text-white/20">lexbase.app — Yönetim Paneli</div>
      </div>

      {/* Dashboard content */}
      <div className="bg-gradient-to-br from-[#0D1117] to-[#131A25] aspect-[16/10] p-6">
        <div className="flex gap-4 h-full">
          {/* Mini sidebar */}
          <div className="w-36 bg-white/[0.02] rounded-xl border border-white/[0.04] p-3 hidden xl:block">
            <div className="font-[var(--font-playfair)] text-xs text-[#D4AF37] font-bold mb-4 px-1">LexBase</div>
            {['📊 Anasayfa', '📒 Rehber', '📁 Davalar', '⚡ İcra', '💰 Finans', '📅 Takvim'].map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: idx === 0 ? 1 : 0.5 }}
                className={`text-[9px] px-2 py-1.5 rounded-md mb-0.5 ${idx === 0 ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white/25'}`}
              >
                {item}
              </motion.div>
            ))}
            <MiniChart />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-white/60 mb-3">Genel Bakış</div>

            {/* KPI Cards — animated counters */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {kpis.map((kpi) => (
                <div key={kpi.l} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                  <div className="font-[var(--font-playfair)] text-sm font-bold" style={{ color: kpi.c }}>
                    <AnimCounter target={kpi.v} prefix={kpi.prefix} suffix={kpi.v === 284 ? 'K' : ''} duration={1.8} />
                  </div>
                  <div className="text-[7px] text-white/25 uppercase tracking-wider mt-0.5">{kpi.l}</div>
                </div>
              ))}
            </div>

            {/* Table — animated rows */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
              <div className="grid grid-cols-4 gap-2 text-[7px] text-white/20 uppercase tracking-wider px-3 py-2 border-b border-white/[0.04]">
                <span>Dosya No</span><span>Müvekkil</span><span>Duruşma</span><span>Durum</span>
              </div>
              {rows.map((row, idx) => (
                <AnimRow key={row.no} row={row} delay={0.6 + idx * 0.2} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
