'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ad: '',
    email: '',
    sifre: '',
    sifreTekrar: '',
    buroAd: '',
    kvkk: false,
  });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const guncelle = (alan: string, deger: string | boolean) => {
    setForm((prev) => ({ ...prev, [alan]: deger }));
  };

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
      options: {
        data: {
          ad_soyad: form.ad,
          buro_ad: form.buroAd,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setHata('Bu e-posta adresi zaten kayıtlı.');
      } else {
        setHata('Kayıt başarısız: ' + error.message);
      }
      setYukleniyor(false);
      return;
    }

    if (data.user) {
      router.push('/dashboard');
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full">
      <h2 className="text-lg font-semibold text-text mb-6">Kayıt Ol</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Ad Soyad</label>
          <input type="text" value={form.ad} onChange={(e) => guncelle('ad', e.target.value)}
            className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
            placeholder="Av. Ahmet Yılmaz" required />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">E-posta</label>
          <input type="email" value={form.email} onChange={(e) => guncelle('email', e.target.value)}
            className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
            placeholder="avukat@example.com" required />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Büro Adı</label>
          <input type="text" value={form.buroAd} onChange={(e) => guncelle('buroAd', e.target.value)}
            className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
            placeholder="Yılmaz Hukuk Bürosu" required />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Şifre</label>
          <input type="password" value={form.sifre} onChange={(e) => guncelle('sifre', e.target.value)}
            className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
            placeholder="En az 8 karakter" required minLength={8} />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Şifre Tekrar</label>
          <input type="password" value={form.sifreTekrar} onChange={(e) => guncelle('sifreTekrar', e.target.value)}
            className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors"
            placeholder="••••••••" required />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={form.kvkk} onChange={(e) => guncelle('kvkk', e.target.checked)}
            className="mt-0.5 accent-[var(--gold)]" />
          <span className="text-[11px] text-text-muted">
            KVKK Aydınlatma Metni ve Kullanım Koşullarını okudum, kabul ediyorum.
          </span>
        </label>

        {hata && (
          <div className="bg-red-dim border border-red rounded-lg px-3 py-2 text-xs text-red">{hata}</div>
        )}

        <button type="submit" disabled={yukleniyor}
          className="w-full py-2.5 bg-gold text-bg font-semibold rounded-lg text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {yukleniyor ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <div className="text-center text-xs text-text-dim mt-4">
        Zaten hesabınız var mı?{' '}
        <Link href="/giris" className="text-gold hover:text-gold-light">Giriş Yap</Link>
      </div>
    </div>
  );
}
