import Link from 'next/link';

/* ══════════════════════════════════════════════════════════════
   Yasal Sayfalar Layout
   Tüm yasal metinler (KVKK, Gizlilik, Kullanım Koşulları vb.)
   bu layout içinde render edilir. Standalone URL ile erişilir.
   ══════════════════════════════════════════════════════════════ */

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0D1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <h1 className="font-[var(--font-playfair)] text-xl text-gold font-bold tracking-tight group-hover:text-gold-light transition-colors">
              LexBase
            </h1>
          </Link>
          <Link
            href="/"
            className="text-[12px] text-text-dim hover:text-text transition-colors flex items-center gap-1.5"
          >
            ← Ana Sayfa
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0D1117]/50">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-text-dim mb-3">
            <Link href="/kullanim-kosullari" className="hover:text-gold transition-colors">Kullanım Koşulları</Link>
            <Link href="/gizlilik-politikasi" className="hover:text-gold transition-colors">Gizlilik Politikası</Link>
            <Link href="/kvkk" className="hover:text-gold transition-colors">KVKK Aydınlatma Metni</Link>
            <Link href="/veri-guvenligi" className="hover:text-gold transition-colors">Veri Güvenliği</Link>
            <Link href="/cerez-ayarlari" className="hover:text-gold transition-colors">Çerez Ayarları</Link>
          </div>
          <p className="text-[10px] text-text-dim/60">
            &copy; {new Date().getFullYear()} LexBase — EMD Yazılım. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
