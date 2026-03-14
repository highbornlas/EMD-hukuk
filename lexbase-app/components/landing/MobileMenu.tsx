'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthTab = 'giris' | 'kayit';

interface MobileMenuProps {
  onOpenAuth: (tab: AuthTab) => void;
}

export function MobileMenu({ onOpenAuth }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Özellikler', href: '#ozellikler' },
    { label: 'Nasıl Çalışır', href: '#nasil' },
    { label: 'Fiyatlar', href: '#fiyatlar' },
    { label: 'SSS', href: '#sss' },
  ];

  const handleNav = (href: string) => {
    setOpen(false);
    // Smooth scroll to section
    const el = document.querySelector(href);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  };

  return (
    <div className="md:hidden">
      {/* Hamburger / X toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex flex-col items-center justify-center gap-[5px] z-[60]"
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
      >
        <span className={`block w-5 h-[2px] bg-white/70 rounded-full transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`block w-5 h-[2px] bg-white/70 rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block w-5 h-[2px] bg-white/70 rounded-full transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
      </button>

      {/* Slide-down panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[45]"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[72px] left-0 right-0 z-[50] bg-[#0D1117]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="max-w-[1400px] mx-auto px-8 py-6">
                {/* Nav links */}
                <nav className="space-y-1 mb-6">
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNav(item.href)}
                      className="block w-full text-left px-4 py-3 text-[15px] text-white/60 hover:text-[#D4AF37] hover:bg-white/[0.03] rounded-xl transition-all duration-200"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Auth buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => { setOpen(false); onOpenAuth('giris'); }}
                    className="flex-1 py-3 text-sm font-semibold text-white/60 border border-white/[0.08] rounded-xl hover:bg-white/[0.03] transition-all duration-200"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => { setOpen(false); onOpenAuth('kayit'); }}
                    className="flex-1 py-3 text-sm font-bold bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-200"
                  >
                    Ücretsiz Başla
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
