'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { AuthModal } from '@/components/auth/AuthModal';
import { InfoModal } from '@/components/ui/InfoModal';
import { ConsentBanner } from '@/components/ui/ConsentBanner';
import { LexBaseLogo } from '@/components/landing/LexBaseLogo';
import { MobileMenu } from '@/components/landing/MobileMenu';
import { Hero } from '@/components/landing/Hero';
import { FeatureMockup } from '@/components/landing/FeatureMockup';
import { PricingToggle, type PricingPeriod } from '@/components/landing/PricingToggle';
import { PricingComparison } from '@/components/landing/PricingComparison';
import { FAQSection } from '@/components/landing/FAQSection';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import {
  KullanimKosullari, GizlilikPolitikasi, KvkkAydinlatma, VeriGuvenligi,
  Hakkimizda, SurumNotlari, Iletisim, YardimMerkezi, CerezAyarlari,
} from '@/lib/legal-content';
import { FEATURES, PLANLAR, SOSYAL_KANIT, ADIMLAR } from '@/lib/landing-data';

/* ═══════════════════════════════════════════════════════════════
   LexBase Landing Page — Premium Dark Tasarım
   ═══════════════════════════════════════════════════════════════ */

type AuthTab = 'giris' | 'kayit';
type InfoPage = 'kullanim' | 'gizlilik' | 'kvkk' | 'veri' | 'hakkimizda' | 'surum' | 'iletisim' | 'yardim' | 'cerez' | null;

const INFO_TITLES: Record<string, string> = {
  kullanim: 'Kullanım Koşulları', gizlilik: 'Gizlilik Politikası', kvkk: 'KVKK Aydınlatma Metni',
  veri: 'Veri Güvenliği', hakkimizda: 'Hakkımızda', surum: 'Sürüm Notları',
  iletisim: 'İletişim', yardim: 'Yardım Merkezi', cerez: 'Çerez Ayarları',
};

const INFO_COMPONENTS: Record<string, React.FC> = {
  kullanim: KullanimKosullari, gizlilik: GizlilikPolitikasi, kvkk: KvkkAydinlatma,
  veri: VeriGuvenligi, hakkimizda: Hakkimizda, surum: SurumNotlari,
  iletisim: Iletisim, yardim: YardimMerkezi, cerez: CerezAyarlari,
};

/* ── Scroll Animation Wrappers ── */
function FadeInUp({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
  );
}

function FadeInLeft({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: -60 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
  );
}

function FadeInRight({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: 60 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('giris');
  const [infoPage, setInfoPage] = useState<InfoPage>(null);
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod>('aylik');

  const openAuth = (tab: AuthTab) => { setAuthTab(tab); setAuthOpen(true); };
  const openInfo = (page: InfoPage) => setInfoPage(page);
  const closeInfo = () => setInfoPage(null);
  const InfoContent = infoPage ? INFO_COMPONENTS[infoPage] : null;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      {/* ── Modals & Global UI ── */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
      <InfoModal open={!!infoPage} onClose={closeInfo} title={infoPage ? INFO_TITLES[infoPage] : ''}>
        {InfoContent && <InfoContent />}
      </InfoModal>
      <ConsentBanner onOpenCerezAyarlari={() => openInfo('cerez')} />
      <ScrollToTop />

      {/* ════════════════════════════════════════════════════
          NAVBAR
          ════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0B0F19]/70 border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <LexBaseLogo variant="full" size={36} />

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: 'Özellikler', href: '#ozellikler' },
              { label: 'Nasıl Çalışır', href: '#nasil' },
              { label: 'Fiyatlar', href: '#fiyatlar' },
              { label: 'SSS', href: '#sss' },
            ].map(l => (
              <a key={l.href} href={l.href} className="text-[15px] text-white/50 hover:text-white transition-colors duration-300">{l.label}</a>
            ))}
          </div>

          {/* Auth buttons + Mobile menu */}
          <div className="flex items-center gap-4">
            <button onClick={() => openAuth('giris')} className="hidden md:block text-[15px] text-white/60 hover:text-white transition-colors duration-300">
              Giriş Yap
            </button>
            <button onClick={() => openAuth('kayit')}
              className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] text-sm font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300">
              Ücretsiz Başla
            </button>
            <MobileMenu onOpenAuth={openAuth} />
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════ */}
      <Hero onOpenAuth={openAuth} />

      {/* ════════════════════════════════════════════════════
          SOSYAL KANIT
          ════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-20 border-y border-white/[0.04] bg-[#0D1117]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeInUp>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16">
              {SOSYAL_KANIT.map(s => (
                <div key={s.l} className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#D4AF37]/[0.08] border border-[#D4AF37]/15 rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">{s.icon}</div>
                  <div>
                    <div className="font-[var(--font-playfair)] text-xl sm:text-2xl text-white font-bold">{s.n}</div>
                    <div className="text-xs sm:text-sm text-white/35">{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ÖZELLİKLER — Z-Pattern + Mockup
          ════════════════════════════════════════════════════ */}
      <section id="ozellikler" className="py-20 sm:py-28 bg-[#0B0F19]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeInUp className="text-center mb-16 sm:mb-24">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Platform Özellikleri</div>
            <h2 className="font-[var(--font-playfair)] text-2xl sm:text-3xl md:text-[2.8rem] text-white font-bold leading-tight">
              Büronuzun ihtiyacı olan her şey,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C64A]">tek platformda.</span>
            </h2>
          </FadeInUp>

          <div className="space-y-20 sm:space-y-32">
            {FEATURES.map((feat, i) => {
              const isReversed = i % 2 === 1;
              return (
                <div key={feat.key} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
                  {/* Mockup */}
                  {isReversed ? (
                    <FadeInRight className="lg:[direction:ltr]"><FeatureMockup featureKey={feat.key} /></FadeInRight>
                  ) : (
                    <FadeInLeft><FeatureMockup featureKey={feat.key} /></FadeInLeft>
                  )}
                  {/* Metin */}
                  {isReversed ? (
                    <FadeInLeft className="lg:[direction:ltr]"><FeatureText feat={feat} /></FadeInLeft>
                  ) : (
                    <FadeInRight><FeatureText feat={feat} /></FadeInRight>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          NASIL ÇALIŞIR
          ════════════════════════════════════════════════════ */}
      <section id="nasil" className="py-20 sm:py-28 bg-[#0D1117] border-y border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeInUp className="text-center mb-14 sm:mb-20">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Nasıl Çalışır</div>
            <h2 className="font-[var(--font-playfair)] text-2xl sm:text-3xl md:text-[2.8rem] text-white font-bold">Dakikalar içinde hazır olun</h2>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {ADIMLAR.map((step, idx) => (
              <FadeInUp key={step.n} delay={idx * 0.15}>
                <div className="relative group">
                  {idx < 3 && <div className="hidden md:block absolute top-10 left-[60%] w-[calc(100%-10px)] h-px bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />}
                  <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8 hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/[0.02] transition-all duration-500 h-full">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#D4AF37]/15 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5">{step.icon}</div>
                    <div className="text-xs text-[#D4AF37] font-bold mb-2 uppercase tracking-wider">Adım {step.n}</div>
                    <h4 className="text-base sm:text-lg font-bold text-white mb-2">{step.t}</h4>
                    <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{step.d}</p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FİYATLANDIRMA
          ════════════════════════════════════════════════════ */}
      <section id="fiyatlar" className="py-20 sm:py-28 bg-[#0B0F19]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeInUp className="text-center mb-12 sm:mb-16">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Fiyatlandırma</div>
            <h2 className="font-[var(--font-playfair)] text-2xl sm:text-3xl md:text-[2.8rem] text-white font-bold mb-4">Her büro için doğru plan</h2>
            <p className="text-white/40 text-base sm:text-lg">30 gün ücretsiz deneyin, beğenirseniz devam edin</p>
          </FadeInUp>

          {/* Toggle */}
          <PricingToggle period={pricingPeriod} onChange={setPricingPeriod} />

          {/* Plan kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {PLANLAR.map((plan, idx) => {
              const fiyat = pricingPeriod === 'aylik' ? plan.fiyatAylik : plan.fiyatYillik;
              const periyot = pricingPeriod === 'aylik' ? plan.periyotAylik : plan.periyotYillik;
              return (
                <FadeInUp key={plan.ad} delay={idx * 0.1}>
                  <div className={`relative rounded-2xl p-6 sm:p-7 flex flex-col h-full transition-all duration-500 ${
                    plan.vurgu
                      ? 'bg-gradient-to-b from-[#D4AF37]/10 to-[#D4AF37]/[0.02] border-2 border-[#D4AF37]/30 shadow-[0_0_60px_rgba(212,175,55,0.08)]'
                      : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]'
                  }`}>
                    {plan.vurgu && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                        EN POPÜLER
                      </div>
                    )}
                    <div className="text-3xl mb-3">{plan.icon}</div>
                    <h3 className="text-lg font-bold text-white">{plan.ad}</h3>
                    <p className="text-xs text-white/30 mb-4">{plan.aciklama}</p>
                    <div className="mb-6">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={fiyat}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="font-[var(--font-playfair)] text-3xl text-[#D4AF37] font-bold inline-block"
                        >
                          {fiyat}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-sm text-white/25 ml-1">{periyot}</span>
                    </div>
                    <div className="border-t border-white/[0.06] pt-5 space-y-3 flex-1 mb-6">
                      {plan.ozellikler.map(oz => (
                        <div key={oz.text} className="flex items-center gap-2.5 text-sm">
                          <span className={oz.var ? 'text-[#D4AF37]' : 'text-white/15'}>{oz.var ? '✓' : '✗'}</span>
                          <span className={oz.var ? 'text-white/60' : 'text-white/20'}>{oz.text}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openAuth('kayit')}
                      className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all duration-300 ${
                        plan.vurgu
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                          : 'bg-white/[0.04] text-white/60 border border-white/[0.08] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/20'
                      }`}>
                      {plan.btnText}
                    </button>
                  </div>
                </FadeInUp>
              );
            })}
          </div>

          {/* Karşılaştırma tablosu */}
          <PricingComparison />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA
          ════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] via-[#0D1117] to-[#0B0F19]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D4AF37]/[0.04] rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-[800px] mx-auto px-6 sm:px-8 text-center">
          <FadeInUp>
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Hemen Başlayın</div>
            <h2 className="font-[var(--font-playfair)] text-2xl sm:text-3xl md:text-5xl text-white font-bold mb-6 leading-tight">
              Büronuzu bugün<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C64A]">dijitale taşıyın</span>
            </h2>
            <p className="text-white/35 text-base sm:text-lg mb-10 sm:mb-12">30 gün ücretsiz — kart bilgisi gerekmez — istediğinizde iptal edin</p>
            <button onClick={() => openAuth('kayit')}
              className="group px-10 sm:px-14 py-4 sm:py-5 bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] text-base sm:text-lg font-bold rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:shadow-[0_0_80px_rgba(212,175,55,0.35)] transition-all duration-500 hover:scale-[1.03]">
              Hemen Başla — Ücretsiz
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </FadeInUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SSS
          ════════════════════════════════════════════════════ */}
      <section id="sss" className="py-20 sm:py-28 bg-[#0D1117] border-y border-white/[0.04]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeInUp className="text-center mb-14 sm:mb-20">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Sıkça Sorulan Sorular</div>
            <h2 className="font-[var(--font-playfair)] text-2xl sm:text-3xl md:text-[2.8rem] text-white font-bold">Merak ettikleriniz</h2>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <FAQSection />
          </FadeInUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-16 sm:py-20 bg-[#080B12]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-14">
            {/* Marka */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <LexBaseLogo variant="full" size={36} />
              </div>
              <p className="text-sm text-white/30 leading-relaxed mb-5">
                Hukuk büronuzu dijitale taşıyan profesyonel platform.
              </p>
              <div className="flex items-center gap-3">
                {['in', 'X', 'ig'].map(s => (
                  <a key={s} href="#" className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/25 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all duration-300 text-sm">{s}</a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-5">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#ozellikler" className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300">Özellikler</a></li>
                <li><a href="#fiyatlar" className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300">Fiyatlandırma</a></li>
                <li><button onClick={() => openInfo('surum')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Sürüm Notları</button></li>
                <li><button onClick={() => openInfo('yardim')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Yardım Merkezi</button></li>
              </ul>
            </div>

            {/* Kurumsal */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-5">LexBase</h4>
              <ul className="space-y-3">
                <li><button onClick={() => openInfo('hakkimizda')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Hakkımızda</button></li>
                <li><button onClick={() => openInfo('iletisim')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">İletişim</button></li>
                <li><a href="#sss" className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300">SSS</a></li>
              </ul>
            </div>

            {/* Yasal */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-5">Yasal</h4>
              <ul className="space-y-3">
                <li><button onClick={() => openInfo('kullanim')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Kullanım Koşulları</button></li>
                <li><button onClick={() => openInfo('gizlilik')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Gizlilik Politikası</button></li>
                <li><button onClick={() => openInfo('kvkk')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">KVKK Aydınlatma Metni</button></li>
                <li><button onClick={() => openInfo('veri')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Veri Güvenliği</button></li>
                <li><button onClick={() => openInfo('cerez')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Çerez Ayarları</button></li>
              </ul>
            </div>
          </div>

          {/* Alt Telif */}
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/20">
            <span>&copy; 2026 LexBase. Tüm hakları saklıdır.</span>
            <span>Türkiye&apos;de Geliştirilmiştir 🇹🇷</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Alt Bileşen ── */
function FeatureText({ feat }: { feat: typeof FEATURES[0] }) {
  return (
    <div>
      <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">{feat.tag}</div>
      <h3 className="font-[var(--font-playfair)] text-xl sm:text-2xl md:text-[2.2rem] text-white font-bold mb-5 leading-tight">{feat.title}</h3>
      <p className="text-sm sm:text-base text-white/40 mb-7 leading-relaxed">{feat.desc}</p>
      <ul className="space-y-3">
        {feat.list.map(item => (
          <li key={item} className="flex items-center gap-3 text-sm sm:text-[15px] text-white/50">
            <span className="w-5 h-5 bg-[#D4AF37]/15 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-[#D4AF37] text-xs">✓</span>
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
