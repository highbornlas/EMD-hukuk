'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AuthModal } from '@/components/auth/AuthModal';
import { InfoModal } from '@/components/ui/InfoModal';
import {
  KullanimKosullari,
  GizlilikPolitikasi,
  KvkkAydinlatma,
  VeriGuvenligi,
  Hakkimizda,
  SurumNotlari,
  Iletisim,
  YardimMerkezi,
  CerezAyarlari,
} from '@/lib/legal-content';

/* ═══════════════════════════════════════════════════════════════
   LexBase Landing Page — Full-Width Premium Tasarım
   • Full-screen hero (min-h-screen, gradient bg)
   • Z-Pattern özellik bölümü (sol görsel/sağ metin → ters)
   • Framer Motion scroll animasyonları (fade-in-up)
   • AuthModal + InfoModal entegrasyonu
   ═══════════════════════════════════════════════════════════════ */

type AuthTab = 'giris' | 'kayit';
type InfoPage =
  | 'kullanim'
  | 'gizlilik'
  | 'kvkk'
  | 'veri'
  | 'hakkimizda'
  | 'surum'
  | 'iletisim'
  | 'yardim'
  | 'cerez'
  | null;

const INFO_TITLES: Record<string, string> = {
  kullanim: 'Kullanım Koşulları',
  gizlilik: 'Gizlilik Politikası',
  kvkk: 'KVKK Aydınlatma Metni',
  veri: 'Veri Güvenliği',
  hakkimizda: 'Hakkımızda',
  surum: 'Sürüm Notları',
  iletisim: 'İletişim',
  yardim: 'Yardım Merkezi',
  cerez: 'Çerez Ayarları',
};

const INFO_COMPONENTS: Record<string, React.FC> = {
  kullanim: KullanimKosullari,
  gizlilik: GizlilikPolitikasi,
  kvkk: KvkkAydinlatma,
  veri: VeriGuvenligi,
  hakkimizda: Hakkimizda,
  surum: SurumNotlari,
  iletisim: Iletisim,
  yardim: YardimMerkezi,
  cerez: CerezAyarlari,
};

/* ── Özellikler (Z-Pattern) ── */
const FEATURES = [
  {
    tag: 'Müvekkil Yönetimi',
    title: 'Tüm müvekkilleriniz, tek merkezde.',
    desc: 'Gerçek ve tüzel kişi profillerini eksiksiz yönetin. TC kimlik, vergi no, MERSİS, IBAN bilgilerinden dava geçmişine kadar her şey elinizin altında.',
    list: ['Gerçek & tüzel kişi profilleri', 'Bağlı dava, icra ve arabuluculuk dosyaları', 'Belge arşivi & WhatsApp entegrasyonu'],
    icon: '📒',
  },
  {
    tag: 'Dava Yönetimi',
    title: 'Davalarınız ve her kuruş, kontrol altında.',
    desc: '50+ mahkeme türü, aşama takibi ve duruşma takvimi. Dava bazlı finansal takiple her harcama ve vekâlet ücreti kayıt altında.',
    list: ['50+ mahkeme türü & vekil yönetimi', 'Harç, bilirkişi, tebligat takibi', 'Vekâlet ücreti & tahsilat yönetimi'],
    icon: '📁',
  },
  {
    tag: 'İcra Takibi',
    title: 'İcra dosyalarınızı kayıpsız yönetin.',
    desc: 'İlamlı, ilamsız, kambiyo ve haciz takiplerinizi 8 farklı icra türü desteğiyle yönetin. Alacak ve tahsilat bakiyeniz her zaman güncel.',
    list: ['8 icra türü desteği', 'İcra dairesi & dosya no takibi', 'Alacak, tahsilat & kalan bakiye'],
    icon: '⚡',
  },
  {
    tag: 'Finans & Raporlama',
    title: 'Büronuzun mali tablosu anlık ve net.',
    desc: 'Gelir, gider, avans ve vekâlet ücretlerini kategorize edin. Müvekkil bazlı kârlılık analizi ve beklenen gelir tahminleri.',
    list: ['Gelir & gider kategorileri', 'Müvekkil kârlılık analizi', 'Fatura & makbuz oluşturma'],
    icon: '💰',
  },
  {
    tag: 'Takvim & Uyarılar',
    title: 'Hiçbir kritik süre gözden kaçmasın.',
    desc: 'Duruşma tarihleri, itiraz süreleri, temyiz son günleri — hepsi renk kodlu uyarılarla karşınızda. Görevlerinizi öncelikle yönetin.',
    list: ['Renk kodlu öncelik sistemi', 'Otomatik duruşma takvimi', 'Görev atama & takip'],
    icon: '📅',
  },
  {
    tag: 'Ekip & Yetki',
    title: 'Ekibinizi yönetin, yetkileri belirleyin.',
    desc: 'Avukat, stajyer ve sekreter için farklı yetki seviyeleri. Modül bazlı erişim kontrolü ile veri güvenliğini sağlayın.',
    list: ['Rol bazlı yetki yönetimi', 'Modül bazlı erişim kontrolü', 'Aktivite logları & denetim'],
    icon: '👥',
  },
];

/* ── Fiyat Planları ── */
const PLANLAR = [
  {
    icon: '🌱', ad: 'Başlangıç', aciklama: 'Tanışma dönemi', fiyat: 'Ücretsiz', periyot: '/ 30 gün',
    ozellikler: [
      { text: '25 Müvekkil', var: true }, { text: '30 Dava, 15 İcra', var: true },
      { text: 'Arabuluculuk', var: true }, { text: 'WhatsApp', var: false },
      { text: 'Finans & Fatura', var: false }, { text: 'Personel hesabı', var: false },
    ],
    vurgu: false, btnText: 'Ücretsiz Başla',
  },
  {
    icon: '⚡', ad: 'Profesyonel', aciklama: 'Tek avukat için ideal', fiyat: '₺399', periyot: '/ ay',
    ozellikler: [
      { text: '150 Müvekkil', var: true }, { text: '200 Dava, 100 İcra', var: true },
      { text: 'WhatsApp', var: true }, { text: 'Finans & Fatura', var: true },
      { text: 'Araç Kutusu', var: true }, { text: 'Personel hesabı', var: false },
    ],
    vurgu: false, btnText: 'Planı Seç',
  },
  {
    icon: '🏛', ad: 'Büro', aciklama: '2-5 kişilik bürolar', fiyat: '₺699', periyot: '/ ay',
    ozellikler: [
      { text: '500 Müvekkil', var: true }, { text: '750 Dava, 400 İcra', var: true },
      { text: 'WhatsApp & Finans', var: true }, { text: 'Araç Kutusu', var: true },
      { text: '5 Personel Hesabı', var: true }, { text: 'Bulut Yedek', var: false },
    ],
    vurgu: true, btnText: 'Planı Seç',
  },
  {
    icon: '🏢', ad: 'Kurumsal', aciklama: 'Büyük bürolar için', fiyat: '₺999', periyot: '/ ay',
    ozellikler: [
      { text: 'Sınırsız Müvekkil', var: true }, { text: 'Sınırsız Dava & İcra', var: true },
      { text: 'Tüm Özellikler', var: true }, { text: 'Sınırsız Personel', var: true },
      { text: 'Bulut Yedekleme', var: true }, { text: 'Özel Destek Hattı', var: true },
    ],
    vurgu: false, btnText: 'Planı Seç',
  },
];

/* ── Scroll Animation Wrapper ── */
function FadeInUp({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeInLeft({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeInRight({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════ */

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('giris');
  const [infoPage, setInfoPage] = useState<InfoPage>(null);

  const openAuth = (tab: AuthTab) => { setAuthTab(tab); setAuthOpen(true); };
  const openInfo = (page: InfoPage) => setInfoPage(page);
  const closeInfo = () => setInfoPage(null);
  const InfoContent = infoPage ? INFO_COMPONENTS[infoPage] : null;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      {/* ── Modals ── */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
      <InfoModal open={!!infoPage} onClose={closeInfo} title={infoPage ? INFO_TITLES[infoPage] : ''}>
        {InfoContent && <InfoContent />}
      </InfoModal>

      {/* ════════════════════════════════════════════════════
          NAVBAR — Transparent + blur, full width
          ════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0B0F19]/70 border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <div className="font-[var(--font-playfair)] text-2xl font-bold tracking-tight">
            <span className="text-[#D4AF37]">Lex</span><span className="text-white">Base</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#ozellikler" className="text-[15px] text-white/50 hover:text-white transition-colors duration-300">Özellikler</a>
            <a href="#nasil" className="text-[15px] text-white/50 hover:text-white transition-colors duration-300">Nasıl Çalışır</a>
            <a href="#fiyatlar" className="text-[15px] text-white/50 hover:text-white transition-colors duration-300">Fiyatlar</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openAuth('giris')}
              className="text-[15px] text-white/60 hover:text-white transition-colors duration-300"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => openAuth('kayit')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] text-sm font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300"
            >
              Ücretsiz Başla
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════
          HERO — Full-screen, gradient bg, büyük başlık
          ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0B0F19] via-[#101726] to-[#131A2B] overflow-hidden">
        {/* Dekoratif arka plan elementleri */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gold glow orb — üst sağ */}
          <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] bg-[#D4AF37]/[0.04] rounded-full blur-[120px]" />
          {/* Blue glow orb — alt sol */}
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0F19_75%)]" />
        </div>

        {/* Hero içerik */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-12 w-full pt-[72px]">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-72px)] py-16">
            {/* Sol — Metin */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[13px] text-[#D4AF37] font-medium mb-8 tracking-wide">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                  Türkiye&apos;nin Hukuk Büroları İçin
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="font-[var(--font-playfair)] text-[3.2rem] md:text-[4rem] lg:text-[4.8rem] font-bold leading-[1.08] mb-7 tracking-tight"
              >
                Hukuk Büronuzu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C64A]">
                  Dijitale Taşıyın.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg md:text-xl text-white/50 mb-10 leading-relaxed max-w-xl"
              >
                Müvekkil yönetiminden dava takibine, icra dosyalarından finansal raporlara — tüm iş akışlarınız tek platformda.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-4 mb-14"
              >
                <button
                  onClick={() => openAuth('kayit')}
                  className="group px-10 py-4 bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] text-base font-bold rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:shadow-[0_0_60px_rgba(212,175,55,0.35)] transition-all duration-500 hover:scale-[1.03]"
                >
                  30 Gün Ücretsiz Dene
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
                <a
                  href="#ozellikler"
                  className="px-10 py-4 border border-white/15 text-white/70 text-base font-semibold rounded-xl hover:bg-white/5 hover:border-white/25 hover:text-white transition-all duration-300"
                >
                  Özellikleri Keşfet
                </a>
              </motion.div>

              {/* İstatistikler */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-10"
              >
                {[
                  { n: '12+', l: 'Modül' },
                  { n: '100%', l: 'Veri Güvenliği' },
                  { n: '30', l: 'Gün Ücretsiz' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-[var(--font-playfair)] text-2xl md:text-3xl text-[#D4AF37] font-bold">{s.n}</div>
                    <div className="text-xs text-white/30 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Sağ — Dashboard Preview (placeholder) */}
            <motion.div
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
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
                {/* Dashboard mockup content */}
                <div className="bg-gradient-to-br from-[#0D1117] to-[#131A25] aspect-[16/10] p-6">
                  {/* Mini sidebar */}
                  <div className="flex gap-4 h-full">
                    <div className="w-36 bg-white/[0.02] rounded-xl border border-white/[0.04] p-3 hidden xl:block">
                      <div className="font-[var(--font-playfair)] text-xs text-[#D4AF37] font-bold mb-4 px-1">LexBase</div>
                      {['📊 Anasayfa', '📒 Rehber', '📁 Davalar', '⚡ İcra', '💰 Finans', '📅 Takvim'].map((item, idx) => (
                        <div key={item} className={`text-[9px] px-2 py-1.5 rounded-md mb-0.5 ${idx === 0 ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white/25'}`}>
                          {item}
                        </div>
                      ))}
                    </div>
                    {/* Main content */}
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-white/60 mb-3">Genel Bakış</div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { v: '148', l: 'Aktif Dava', c: '#D4AF37' },
                          { v: '₺284K', l: 'Gelir', c: '#2ecc71' },
                          { v: '27', l: 'Müvekkil', c: '#fff' },
                          { v: '5', l: 'Kritik', c: '#e74c3c' },
                        ].map((kpi) => (
                          <div key={kpi.l} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                            <div className="font-[var(--font-playfair)] text-sm font-bold" style={{ color: kpi.c }}>{kpi.v}</div>
                            <div className="text-[7px] text-white/25 uppercase tracking-wider mt-0.5">{kpi.l}</div>
                          </div>
                        ))}
                      </div>
                      {/* Table rows */}
                      <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
                        <div className="grid grid-cols-4 gap-2 text-[7px] text-white/20 uppercase tracking-wider px-3 py-2 border-b border-white/[0.04]">
                          <span>Dosya No</span><span>Müvekkil</span><span>Duruşma</span><span>Durum</span>
                        </div>
                        {[
                          { no: '2024/1247', ad: 'K. Yılmaz', tarih: '15.03', durum: 'Aktif', cls: 'bg-emerald-500/20 text-emerald-400' },
                          { no: '2024/0934', ad: 'Altın Yapı', tarih: '22.03', durum: 'Bekleme', cls: 'bg-[#D4AF37]/20 text-[#D4AF37]' },
                          { no: '2023/2108', ad: 'L. Sönmez', tarih: '—', durum: 'Kapandı', cls: 'bg-red-500/20 text-red-400' },
                        ].map((row) => (
                          <div key={row.no} className="grid grid-cols-4 gap-2 text-[8px] px-3 py-2 border-b border-white/[0.03] last:border-0">
                            <span className="text-white/20">{row.no}</span>
                            <span className="text-white/40">{row.ad}</span>
                            <span className="text-white/25">{row.tarih}</span>
                            <span><span className={`px-1.5 py-0.5 rounded text-[7px] ${row.cls}`}>{row.durum}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow behind the mockup */}
              <div className="absolute -inset-8 bg-[#D4AF37]/[0.03] rounded-3xl blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/15 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          SOSYAL KANIT — Güven strip
          ════════════════════════════════════════════════════ */}
      <section className="relative py-20 border-y border-white/[0.04] bg-[#0D1117]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12">
          <FadeInUp>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
              {[
                { n: '12+', l: 'Profesyonel Modül', icon: '📦' },
                { n: '100%', l: 'Veri Güvenliği', icon: '🔒' },
                { n: '7/24', l: 'Bulut Erişim', icon: '☁️' },
                { n: '4', l: 'Esnek Plan', icon: '⚡' },
              ].map((s) => (
                <div key={s.l} className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#D4AF37]/[0.08] border border-[#D4AF37]/15 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <div className="font-[var(--font-playfair)] text-2xl text-white font-bold">{s.n}</div>
                    <div className="text-sm text-white/35">{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ÖZELLİKLER — Z-Pattern Layout
          ════════════════════════════════════════════════════ */}
      <section id="ozellikler" className="py-28 bg-[#0B0F19]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12">
          {/* Bölüm başlığı */}
          <FadeInUp className="text-center mb-24">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Platform Özellikleri</div>
            <h2 className="font-[var(--font-playfair)] text-3xl md:text-[2.8rem] text-white font-bold leading-tight">
              Büronuzun ihtiyacı olan her şey,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C64A]">tek platformda.</span>
            </h2>
          </FadeInUp>

          {/* Z-Pattern Özellik Blokları */}
          <div className="space-y-32">
            {FEATURES.map((feat, i) => {
              const isReversed = i % 2 === 1;
              return (
                <div key={feat.tag} className={`grid lg:grid-cols-2 gap-16 xl:gap-24 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
                  {/* Görsel placeholder */}
                  {isReversed ? (
                    <FadeInRight className="lg:[direction:ltr]">
                      <FeatureVisual icon={feat.icon} tag={feat.tag} />
                    </FadeInRight>
                  ) : (
                    <FadeInLeft>
                      <FeatureVisual icon={feat.icon} tag={feat.tag} />
                    </FadeInLeft>
                  )}

                  {/* Metin */}
                  {isReversed ? (
                    <FadeInLeft className="lg:[direction:ltr]">
                      <FeatureText feat={feat} />
                    </FadeInLeft>
                  ) : (
                    <FadeInRight>
                      <FeatureText feat={feat} />
                    </FadeInRight>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          NASIL ÇALIŞIR — 4 Adım
          ════════════════════════════════════════════════════ */}
      <section id="nasil" className="py-28 bg-[#0D1117] border-y border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <FadeInUp className="text-center mb-20">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Nasıl Çalışır</div>
            <h2 className="font-[var(--font-playfair)] text-3xl md:text-[2.8rem] text-white font-bold">
              Dakikalar içinde hazır olun
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: '1', t: 'Kaydolun', d: '30 saniyelik kayıt formuyla büronuzu oluşturun. Kart bilgisi gerekmez.', icon: '📝' },
              { n: '2', t: 'Müvekkil Ekleyin', d: 'Gerçek veya tüzel kişi profillerini hızlıca girin.', icon: '👤' },
              { n: '3', t: 'Davaları Açın', d: 'Dava ve icra dosyaları oluşturun. Takvim otomatik güncellenir.', icon: '📁' },
              { n: '4', t: 'Yönetin', d: "Dashboard'dan tüm iş akışlarınızı izleyin. Raporlarla karar alın.", icon: '📊' },
            ].map((step, idx) => (
              <FadeInUp key={step.n} delay={idx * 0.15}>
                <div className="relative group">
                  {/* Connector line */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[calc(100%-10px)] h-px bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />
                  )}
                  <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/[0.02] transition-all duration-500 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/15 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-2xl mb-5">
                      {step.icon}
                    </div>
                    <div className="text-xs text-[#D4AF37] font-bold mb-2 uppercase tracking-wider">Adım {step.n}</div>
                    <h4 className="text-lg font-bold text-white mb-2">{step.t}</h4>
                    <p className="text-sm text-white/40 leading-relaxed">{step.d}</p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FİYATLANDIRMA — 4 Plan
          ════════════════════════════════════════════════════ */}
      <section id="fiyatlar" className="py-28 bg-[#0B0F19]">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <FadeInUp className="text-center mb-20">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Fiyatlandırma</div>
            <h2 className="font-[var(--font-playfair)] text-3xl md:text-[2.8rem] text-white font-bold mb-4">
              Her büro için doğru plan
            </h2>
            <p className="text-white/40 text-lg">30 gün ücretsiz deneyin, beğenirseniz devam edin</p>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANLAR.map((plan, idx) => (
              <FadeInUp key={plan.ad} delay={idx * 0.1}>
                <div className={`relative rounded-2xl p-7 flex flex-col h-full transition-all duration-500 ${
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
                    <span className="font-[var(--font-playfair)] text-3xl text-[#D4AF37] font-bold">{plan.fiyat}</span>
                    <span className="text-sm text-white/25 ml-1">{plan.periyot}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-5 space-y-3 flex-1 mb-6">
                    {plan.ozellikler.map((oz) => (
                      <div key={oz.text} className="flex items-center gap-2.5 text-sm">
                        <span className={oz.var ? 'text-[#D4AF37]' : 'text-white/15'}>
                          {oz.var ? '✓' : '✗'}
                        </span>
                        <span className={oz.var ? 'text-white/60' : 'text-white/20'}>{oz.text}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => openAuth('kayit')}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all duration-300 ${
                      plan.vurgu
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                        : 'bg-white/[0.04] text-white/60 border border-white/[0.08] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/20'
                    }`}
                  >
                    {plan.btnText}
                  </button>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA — Full width gold accent
          ════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] via-[#0D1117] to-[#0B0F19]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D4AF37]/[0.04] rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-[800px] mx-auto px-8 text-center">
          <FadeInUp>
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Hemen Başlayın</div>
            <h2 className="font-[var(--font-playfair)] text-3xl md:text-5xl text-white font-bold mb-6 leading-tight">
              Büronuzu bugün<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C64A]">dijitale taşıyın</span>
            </h2>
            <p className="text-white/35 text-lg mb-12">30 gün ücretsiz — kart bilgisi gerekmez — istediğinizde iptal edin</p>
            <button
              onClick={() => openAuth('kayit')}
              className="group px-14 py-5 bg-gradient-to-r from-[#D4AF37] to-[#E8C64A] text-[#0B0F19] text-lg font-bold rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:shadow-[0_0_80px_rgba(212,175,55,0.35)] transition-all duration-500 hover:scale-[1.03]"
            >
              Hemen Başla — Ücretsiz
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </FadeInUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER — 4 Sütun, full width
          ════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-20 bg-[#080B12]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
            {/* Marka */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl flex items-center justify-center">
                  <span className="font-[var(--font-playfair)] text-lg text-[#D4AF37] font-bold">L</span>
                </div>
                <span className="font-[var(--font-playfair)] text-xl text-white font-bold">LexBase</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed mb-5">
                Hukuk büronuzu dijitale taşıyan profesyonel platform.
              </p>
              <div className="flex items-center gap-3">
                {['in', 'X', 'ig'].map((s) => (
                  <a key={s} href="#" className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/25 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all duration-300 text-sm">
                    {s}
                  </a>
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
                <li><button onClick={() => openInfo('yardim')} className="text-sm text-white/35 hover:text-[#D4AF37] transition-colors duration-300 text-left">Yardım Merkezi</button></li>
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
            <span>© 2026 LexBase. Tüm hakları saklıdır.</span>
            <span>Türkiye&apos;de Geliştirilmiştir 🇹🇷</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Alt Bileşenler ── */

function FeatureVisual({ icon, tag }: { icon: string; tag: string }) {
  return (
    <div className="relative">
      <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center hover:border-[#D4AF37]/15 transition-all duration-500 group">
        {/* İçerik yerine ekran görüntüsü konacak */}
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30 group-hover:opacity-50 transition-opacity duration-500">{icon}</div>
          <div className="text-sm text-white/15 font-medium">{tag}</div>
          <div className="text-[10px] text-white/10 mt-1">Ekran görüntüsü eklenecek</div>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/50 to-transparent pointer-events-none" />
      </div>
      {/* Glow */}
      <div className="absolute -inset-4 bg-[#D4AF37]/[0.02] rounded-3xl blur-2xl -z-10" />
    </div>
  );
}

function FeatureText({ feat }: { feat: typeof FEATURES[0] }) {
  return (
    <div>
      <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">{feat.tag}</div>
      <h3 className="font-[var(--font-playfair)] text-2xl md:text-[2.2rem] text-white font-bold mb-5 leading-tight">{feat.title}</h3>
      <p className="text-base text-white/40 mb-7 leading-relaxed">{feat.desc}</p>
      <ul className="space-y-3">
        {feat.list.map((item) => (
          <li key={item} className="flex items-center gap-3 text-[15px] text-white/50">
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
