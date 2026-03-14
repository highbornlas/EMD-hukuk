'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/* ══════════════════════════════════════════════════════════════
   Şifre Sıfırlama Sayfası
   - E-postadaki link tıklanınca /auth/callback → buraya yönlendirir
   - Kullanıcı yeni şifresini girer
   - supabase.auth.updateUser({ password }) ile günceller
   ══════════════════════════════════════════════════════════════ */

export default function SifreSifirlaPage() {
  const router = useRouter();
  const [yeniSifre, setYeniSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oturumKontrol, setOturumKontrol] = useState(true);
  const [oturumVar, setOturumVar] = useState(false);

  // Sayfa açıldığında oturum kontrolü yap
  // (callback'ten gelen recovery session olmalı)
  useEffect(() => {
    const supabase = createClient();

    async function kontrol() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setOturumVar(true);
      }
      setOturumKontrol(false);
    }

    // PASSWORD_RECOVERY event'ini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setOturumVar(true);
        setOturumKontrol(false);
      }
    });

    kontrol();

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata('');

    if (yeniSifre.length < 8) {
      setHata('Şifre en az 8 karakter olmalı.');
      return;
    }
    if (yeniSifre !== sifreTekrar) {
      setHata('Şifreler eşleşmiyor.');
      return;
    }

    setYukleniyor(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password: yeniSifre });

    if (error) {
      setHata('Şifre güncellenemedi: ' + error.message);
      setYukleniyor(false);
      return;
    }

    setBasarili(true);
    setYukleniyor(false);

    // 2 saniye sonra dashboard'a yönlendir
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  // Yükleniyor
  if (oturumKontrol) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-text-dim text-sm">Oturum kontrol ediliyor...</div>
      </div>
    );
  }

  // Oturum yoksa — link geçersiz veya süresi dolmuş
  if (!oturumVar) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] bg-[#0D1117] border border-[rgba(201,168,76,0.18)] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.85)] p-8 text-center">
          <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold mb-3">LexBase</h1>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-dim flex items-center justify-center text-xl">
            ⚠️
          </div>
          <h2 className="text-base font-semibold text-text mb-2">Bağlantı Geçersiz</h2>
          <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
            Şifre sıfırlama bağlantısının süresi dolmuş veya daha önce kullanılmış olabilir.
            Lütfen tekrar şifre sıfırlama talebinde bulunun.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#E0C068] text-[#0D1117] font-bold rounded-xl text-sm shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.45)] transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Başarılı
  if (basarili) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] bg-[#0D1117] border border-[rgba(201,168,76,0.18)] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.85)] p-8 text-center">
          <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold mb-3">LexBase</h1>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-dim flex items-center justify-center text-xl">
            ✓
          </div>
          <h2 className="text-base font-semibold text-text mb-2">Şifre Güncellendi</h2>
          <p className="text-[13px] text-text-muted mb-2 leading-relaxed">
            Şifreniz başarıyla değiştirildi. Yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  // Şifre değiştirme formu
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-[#0D1117] border border-[rgba(201,168,76,0.18)] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(201,168,76,0.06)] p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-[var(--font-playfair)] text-2xl text-gold font-bold tracking-tight">LexBase</h1>
          <p className="text-[12px] text-text-dim mt-1">Yeni Şifre Belirleyin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
              className="w-full px-4 py-3 bg-[#161B22] border border-[#2A3142] rounded-xl text-sm text-text placeholder:text-text-dim focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] outline-none transition-all"
              placeholder="En az 8 karakter"
              required
              minLength={8}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Yeni Şifre Tekrar
            </label>
            <input
              type="password"
              value={sifreTekrar}
              onChange={(e) => setSifreTekrar(e.target.value)}
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

          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full py-3 bg-gradient-to-r from-[#C9A84C] to-[#E0C068] text-[#0D1117] font-bold rounded-xl text-sm shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.45)] hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {yukleniyor ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}
