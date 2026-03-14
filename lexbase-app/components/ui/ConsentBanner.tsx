'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsentBannerProps {
  onOpenCerezAyarlari: () => void;
}

export function ConsentBanner({ onOpenCerezAyarlari }: ConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // SSR guard: sadece client'ta kontrol et
    try {
      const consent = localStorage.getItem('lb_consent');
      if (!consent) setVisible(true);
    } catch {
      // localStorage erişim hatası (private mode vs.) → banner göster
      setVisible(true);
    }
  }, []);

  const accept = (type: 'all' | 'essential') => {
    try {
      localStorage.setItem('lb_consent', JSON.stringify({
        accepted: true,
        type,
        date: new Date().toISOString(),
      }));
    } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.08]"
        >
          <div className="bg-[#131A2B]/95 backdrop-blur-xl">
            <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                {/* Metin */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/60 leading-relaxed">
                    Bu web sitesi, deneyiminizi iyileştirmek için zorunlu çerezler ve benzer teknolojiler kullanmaktadır.
                    Tercihlerinizi yönetmek için{' '}
                    <button
                      onClick={() => { setVisible(false); onOpenCerezAyarlari(); }}
                      className="text-[#D4AF37] hover:underline underline-offset-2 font-medium"
                    >
                      Çerez Ayarları
                    </button>
                    {' '}sayfamızı ziyaret edebilirsiniz.
                  </p>
                </div>

                {/* Butonlar */}
                <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => accept('essential')}
                    className="flex-1 md:flex-none px-5 py-2.5 text-sm font-medium text-white/60 border border-white/[0.1] rounded-xl hover:bg-white/[0.04] hover:text-white/80 transition-all duration-200"
                  >
                    Sadece Zorunlu
                  </button>
                  <button
                    onClick={() => accept('all')}
                    className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-200"
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
