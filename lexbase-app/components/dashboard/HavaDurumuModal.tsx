'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHavaDurumu, SEHIRLER, type Sehir } from '@/lib/hooks/useHavaDurumu';

/* ══════════════════════════════════════════════════════════════
   Hava Durumu Modal — Detaylı görünüm
   Mevcut durum + Saatlik tahmin + 7 günlük tahmin + Şehir seçimi
   ══════════════════════════════════════════════════════════════ */

interface HavaDurumuModalProps {
  open: boolean;
  onClose: () => void;
}

export function HavaDurumuModal({ open, onClose }: HavaDurumuModalProps) {
  const { data, isLoading, mevcutSehir, sehirDegistir, gpsAktif } = useHavaDurumu();
  const [sehirAcik, setSehirAcik] = useState(false);
  const sehirRef = useRef<HTMLDivElement>(null);
  const saatlikRef = useRef<HTMLDivElement>(null);

  // Click outside → şehir dropdown kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sehirRef.current && !sehirRef.current.contains(e.target as Node)) {
        setSehirAcik(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ESC → modal kapat
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">

              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{data?.mevcut.ikon || '🌡️'}</span>
                  <div>
                    <h2 className="text-base font-bold text-text">Hava Durumu</h2>
                    {/* Şehir seçici */}
                    <div className="relative" ref={sehirRef}>
                      <button
                        onClick={() => setSehirAcik(!sehirAcik)}
                        className="flex items-center gap-1 text-[12px] text-text-muted hover:text-gold transition-colors"
                      >
                        {gpsAktif && <span title="GPS ile belirlendi">📍</span>}
                        <span>{mevcutSehir.ad}</span>
                        <span className="text-[10px]">▾</span>
                      </button>

                      {/* Şehir Dropdown */}
                      {sehirAcik && (
                        <div className="absolute left-0 top-full mt-1 w-48 max-h-60 overflow-y-auto
                                       bg-surface border border-border rounded-xl shadow-lg z-10 py-1">
                          {SEHIRLER.map((s) => (
                            <button
                              key={s.ad}
                              onClick={() => {
                                sehirDegistir(s);
                                setSehirAcik(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-surface2 transition-colors ${
                                s.ad === mevcutSehir.ad ? 'text-gold font-semibold' : 'text-text-muted'
                              }`}
                            >
                              {s.ad}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             text-text-dim hover:bg-surface2 hover:text-text transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* ── İçerik ── */}
              <div className="overflow-y-auto max-h-[calc(85vh-72px)]">
                {isLoading ? (
                  <div className="px-5 py-10 text-center">
                    <div className="text-3xl mb-3 animate-pulse">🌤️</div>
                    <p className="text-sm text-text-dim">Hava durumu yükleniyor...</p>
                  </div>
                ) : !data ? (
                  <div className="px-5 py-10 text-center">
                    <div className="text-3xl mb-3">⚠️</div>
                    <p className="text-sm text-text-dim">Hava durumu alınamadı</p>
                  </div>
                ) : (
                  <>
                    {/* ═══ MEVCUT DURUM ═══ */}
                    <div className="px-5 py-5 bg-gradient-to-br from-surface2/50 to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-[var(--font-playfair)] text-5xl font-bold text-text leading-none">
                            {data.mevcut.sicaklik}°
                          </div>
                          <div className="text-sm text-text-muted mt-1">{data.mevcut.aciklama}</div>
                        </div>
                        <div className="text-6xl leading-none">{data.mevcut.ikon}</div>
                      </div>

                      {/* Detay satırı */}
                      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">💧</span>
                          <span className="text-[12px] text-text-muted">Nem</span>
                          <span className="text-[12px] font-semibold text-text">%{data.mevcut.nem}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">💨</span>
                          <span className="text-[12px] text-text-muted">Rüzgar</span>
                          <span className="text-[12px] font-semibold text-text">{data.mevcut.ruzgar} km/s</span>
                        </div>
                        {data.gunluk[0] && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">🌡️</span>
                            <span className="text-[12px] text-text-muted">Min/Max</span>
                            <span className="text-[12px] font-semibold text-text">
                              {data.gunluk[0].minSicaklik}° / {data.gunluk[0].maxSicaklik}°
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ═══ SAATLİK TAHMİN ═══ */}
                    <div className="px-5 py-4 border-t border-border/30">
                      <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">
                        Saatlik Tahmin
                      </h3>
                      <div
                        ref={saatlikRef}
                        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
                        style={{ scrollbarWidth: 'thin' }}
                      >
                        {data.saatlik.slice(0, 24).map((s, i) => (
                          <div
                            key={i}
                            className={`flex-shrink-0 flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg
                                       ${i === 0 ? 'bg-gold/10 border border-gold/20' : 'bg-surface2/50'}`}
                            style={{ minWidth: 52 }}
                          >
                            <span className="text-[10px] text-text-dim">{i === 0 ? 'Şimdi' : s.saat}</span>
                            <span className="text-sm">{s.ikon}</span>
                            <span className="text-[11px] font-semibold text-text">{s.sicaklik}°</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ═══ HAFTALIK TAHMİN ═══ */}
                    <div className="px-5 py-4 border-t border-border/30">
                      <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">
                        7 Günlük Tahmin
                      </h3>
                      <div className="space-y-1">
                        {data.gunluk.map((g, i) => {
                          // Sıcaklık barı genişliği hesaplama
                          const allMin = Math.min(...data.gunluk.map((d) => d.minSicaklik));
                          const allMax = Math.max(...data.gunluk.map((d) => d.maxSicaklik));
                          const range = allMax - allMin || 1;
                          const leftPct = ((g.minSicaklik - allMin) / range) * 100;
                          const widthPct = ((g.maxSicaklik - g.minSicaklik) / range) * 100;

                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                i === 0 ? 'bg-gold/[0.06]' : 'hover:bg-surface2/30'
                              } transition-colors`}
                            >
                              {/* Gün adı */}
                              <div className="w-[72px] flex-shrink-0">
                                <div className={`text-[12px] font-medium ${i === 0 ? 'text-gold' : 'text-text'}`}>
                                  {g.gun}
                                </div>
                                <div className="text-[10px] text-text-dim">{g.tarih}</div>
                              </div>

                              {/* İkon */}
                              <span className="text-base w-6 text-center flex-shrink-0">{g.ikon}</span>

                              {/* Min sıcaklık */}
                              <span className="text-[11px] text-text-dim w-6 text-right flex-shrink-0">
                                {g.minSicaklik}°
                              </span>

                              {/* Sıcaklık barı */}
                              <div className="flex-1 h-1.5 bg-surface2 rounded-full relative overflow-hidden mx-1">
                                <div
                                  className="absolute top-0 h-full rounded-full bg-gradient-to-r from-blue-400 via-gold to-orange-400"
                                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 4)}%` }}
                                />
                              </div>

                              {/* Max sıcaklık */}
                              <span className="text-[11px] font-semibold text-text w-6 text-left flex-shrink-0">
                                {g.maxSicaklik}°
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ═══ FOOTER ═══ */}
                    <div className="px-5 py-3 border-t border-border/30 text-center">
                      <span className="text-[10px] text-text-dim">
                        Open-Meteo API · Son güncelleme: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
