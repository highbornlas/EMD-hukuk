'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/* ══════════════════════════════════════════════════════════════
   AuthModal — Orijinal Vanilla JS Giriş/Kayıt Modal
   - Gold arkaplan aktif sekme (orijinaldeki gibi)
   - Google ile giriş yap
   - "VEYA" separator
   - "Şifremi unuttum" + "Bağlantı ile giriş (şifresiz)"
   - Uppercase label'lar
   ══════════════════════════════════════════════════════════════ */

type AuthTab = 'giris' | 'kayit';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}

export function AuthModal({ open, onClose, defaultTab = 'giris' }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, defaultTab]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in-up"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-[95%] max-w-[440px] bg-[#0D1117] border border-[rgba(201,168,76,0.18)] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(201,168,76,0.06)] animate-scale-in">
        {/* ── Kapat ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-text-dim hover:text-text hover:bg-white/10 transition-all"
        >
          ✕
        </button>

        {/* ── Logo ── */}
        <div className="text-center pt-8 pb-3">
          <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold tracking-tight">LexBase</h1>
          <p className="text-[12px] text-text-dim mt-1">Hukuk Bürosu Yönetim Platformu</p>
        </div>

        {/* ── Sekmeler — Gold arkaplan aktif ── */}
        <div className="flex mx-6 gap-1 mb-1">
          {(['giris', 'kayit'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${tab === t
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#E0C068] text-[#0D1117] shadow-[0_2px_12px_rgba(201,168,76,0.3)]'
                  : 'text-text-dim hover:text-text-muted hover:bg-white/5'
                }`}
            >
              {t === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          ))}
        </div>

        {/* ── Form İçeriği ── */}
        <div className="px-6 pt-4 pb-6">
          {tab === 'giris' ? (
            <GirisForm onClose={onClose} onSwitchTab={() => setTab('kayit')} />
          ) : (
            <KayitForm onClose={onClose} onSwitchTab={() => setTab('giris')} />
          )}
        </div>
      </div>
    </div>
  );
}


/* ── Giriş Formu ───────────────────────────────────────────── */
function GirisForm({ onClose, onSwitchTab }: { onClose: () => void; onSwitchTab: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });

    if (error) {
      setHata(error.message.includes('Invalid login credentials')
        ? 'E-posta veya şifre hatalı.'
        : 'Giriş başarısız: ' + error.message);
      setYukleniyor(false);
      return;
    }

    onClose();
    router.push('/dashboard');
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function handleMagicLink() {
    if (!email) {
      setHata('Bağlantı göndermek için e-posta adresinizi girin.');
      return;
    }
    setHata('');
    setYukleniyor(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setYukleniyor(false);
    if (error) {
      setHata('Bağlantı gönderilemedi: ' + error.message);
    } else {
      setHata('');
      alert('Giriş bağlantısı e-posta adresinize gönderildi!');
    }
  }

  return (
    <div className="space-y-4">
      {/* Google ile Giriş */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3 bg-[#161B22] border border-[#2A3142] rounded-xl text-sm font-medium text-text hover:border-[rgba(201,168,76,0.4)] hover:bg-[#1C2333] transition-all duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Google ile giriş yap
      </button>

      {/* VEYA Separator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#2A3142]" />
        <span className="text-[11px] text-text-dim uppercase tracking-wider font-medium">veya</span>
        <div className="flex-1 h-px bg-[#2A3142]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">E-Posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#161B22] border border-[#2A3142] rounded-xl text-sm text-text placeholder:text-text-dim focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] outline-none transition-all"
            placeholder="örnek@mail.com"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Şifre</label>
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full px-4 py-3 bg-[#161B22] border border-[#2A3142] rounded-xl text-sm text-text placeholder:text-text-dim focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] outline-none transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        {hata && (
          <div className="bg-red-dim border border-red/20 rounded-xl px-3 py-2.5 text-[11px] text-red">
            {hata}
          </div>
        )}

        <button type="submit" disabled={yukleniyor}
          className="w-full py-3 bg-gradient-to-r from-[#C9A84C] to-[#E0C068] text-[#0D1117] font-bold rounded-xl text-sm shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.45)] hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      {/* Alt linkler */}
      <div className="space-y-2 text-center">
        <button
          type="button"
          onClick={() => {
            const emailInput = document.querySelector<HTMLInputElement>('input[type="email"]');
            if (emailInput?.value) {
              handleMagicLink();
            } else {
              emailInput?.focus();
            }
          }}
          className="text-[12px] text-gold hover:text-gold-light transition-colors block mx-auto"
        >
          Şifremi unuttum
        </button>
        <button
          type="button"
          onClick={handleMagicLink}
          className="text-[12px] text-gold hover:text-gold-light transition-colors flex items-center gap-1.5 mx-auto"
        >
          <span>🔗</span> Bağlantı ile giriş (şifresiz)
        </button>
      </div>
    </div>
  );
}


/* ── Kayıt Formu ───────────────────────────────────────────── */
function KayitForm({ onClose, onSwitchTab }: { onClose: () => void; onSwitchTab: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ad: '', email: '', sifre: '', sifreTekrar: '', buroAd: '', kvkk: false,
  });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const guncelle = (alan: string, deger: string | boolean) => {
    setForm((prev) => ({ ...prev, [alan]: deger }));
  };

  const inputCls = "w-full px-4 py-3 bg-[#161B22] border border-[#2A3142] rounded-xl text-sm text-text placeholder:text-text-dim focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] outline-none transition-all";

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata('');

    if (form.sifre.length < 8) { setHata('Şifre en az 8 karakter olmalı.'); return; }
    if (form.sifre !== form.sifreTekrar) { setHata('Şifreler eşleşmiyor.'); return; }
    if (!form.kvkk) { setHata('KVKK aydınlatma metnini kabul etmeniz gerekiyor.'); return; }

    setYukleniyor(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.sifre,
      options: { data: { ad_soyad: form.ad, buro_ad: form.buroAd } },
    });

    if (error) {
      setHata(error.message.includes('already registered')
        ? 'Bu e-posta adresi zaten kayıtlı.'
        : 'Kayıt başarısız: ' + error.message);
      setYukleniyor(false);
      return;
    }

    if (data.user) {
      onClose();
      router.push('/dashboard');
    }
  }

  return (
    <div className="space-y-4">
      {/* Google ile Kayıt */}
      <button
        onClick={handleGoogleSignup}
        className="w-full flex items-center justify-center gap-3 py-3 bg-[#161B22] border border-[#2A3142] rounded-xl text-sm font-medium text-text hover:border-[rgba(201,168,76,0.4)] hover:bg-[#1C2333] transition-all duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Google ile kayıt ol
      </button>

      {/* VEYA Separator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#2A3142]" />
        <span className="text-[11px] text-text-dim uppercase tracking-wider font-medium">veya</span>
        <div className="flex-1 h-px bg-[#2A3142]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Ad Soyad</label>
          <input type="text" value={form.ad} onChange={(e) => guncelle('ad', e.target.value)}
            className={inputCls} placeholder="Av. Ahmet Yılmaz" required />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">E-Posta</label>
          <input type="email" value={form.email} onChange={(e) => guncelle('email', e.target.value)}
            className={inputCls} placeholder="avukat@example.com" required />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Büro Adı</label>
          <input type="text" value={form.buroAd} onChange={(e) => guncelle('buroAd', e.target.value)}
            className={inputCls} placeholder="Yılmaz Hukuk Bürosu" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Şifre</label>
            <input type="password" value={form.sifre} onChange={(e) => guncelle('sifre', e.target.value)}
              className={inputCls} placeholder="En az 8 karakter" required minLength={8} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Şifre Tekrar</label>
            <input type="password" value={form.sifreTekrar} onChange={(e) => guncelle('sifreTekrar', e.target.value)}
              className={inputCls} placeholder="••••••••" required />
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer py-1">
          <input type="checkbox" checked={form.kvkk} onChange={(e) => guncelle('kvkk', e.target.checked)}
            className="mt-0.5 accent-[var(--gold)] w-4 h-4" />
          <span className="text-[11px] text-text-muted leading-relaxed">
            KVKK Aydınlatma Metni ve Kullanım Koşullarını okudum, kabul ediyorum.
          </span>
        </label>

        {hata && (
          <div className="bg-red-dim border border-red/20 rounded-xl px-3 py-2.5 text-[11px] text-red">
            {hata}
          </div>
        )}

        <button type="submit" disabled={yukleniyor}
          className="w-full py-3 bg-gradient-to-r from-[#C9A84C] to-[#E0C068] text-[#0D1117] font-bold rounded-xl text-sm shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.45)] hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {yukleniyor ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="text-center text-[11px] text-text-dim">
        Zaten hesabınız var mı?{' '}
        <button type="button" onClick={onSwitchTab} className="text-gold hover:text-gold-light font-semibold transition-colors">
          Giriş Yap
        </button>
      </p>
    </div>
  );
}
