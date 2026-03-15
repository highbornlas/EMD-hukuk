'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ══════════════════════════════════════════════════════════════
   Rol & Yetki Sistemi
   ══════════════════════════════════════════════════════════════ */

export type Rol = 'yonetici' | 'avukat' | 'stajyer' | 'sekreter';

export const ROL_ETIKETLERI: Record<Rol, { label: string; kisa: string; renk: string }> = {
  yonetici: { label: 'Yönetici', kisa: 'Yön.', renk: 'text-gold bg-gold-dim border-gold/20' },
  avukat: { label: 'Avukat', kisa: 'Av.', renk: 'text-green bg-green-dim border-green/20' },
  stajyer: { label: 'Stajyer', kisa: 'Stj.', renk: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  sekreter: { label: 'Sekreter', kisa: 'Sek.', renk: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

// ── Yetki Haritası ────────────────────────────────────────────
const YETKI_HARITASI: Record<Rol, Set<string>> = {
  yonetici: new Set([
    'muvekkil:oku', 'muvekkil:ekle', 'muvekkil:duzenle', 'muvekkil:sil',
    'dosya:oku', 'dosya:ekle', 'dosya:duzenle', 'dosya:sil',
    'finans:oku', 'finans:ekle', 'finans:duzenle',
    'belge:oku', 'belge:yukle', 'belge:sil',
    'gorev:oku', 'gorev:ekle', 'gorev:duzenle', 'gorev:sil',
    'takvim:oku', 'takvim:ekle', 'takvim:duzenle',
    'iletisim:oku', 'iletisim:ekle',
    'danismanlik:oku', 'danismanlik:ekle', 'danismanlik:duzenle',
    'rapor:oku', 'rapor:export',
    'ayarlar:oku', 'ayarlar:duzenle',
    'kullanici:yonet',
    'audit:oku',
    'toplu:sil', 'toplu:export',
  ]),
  avukat: new Set([
    'muvekkil:oku', 'muvekkil:ekle', 'muvekkil:duzenle', 'muvekkil:sil',
    'dosya:oku', 'dosya:ekle', 'dosya:duzenle', 'dosya:sil',
    'finans:oku', 'finans:ekle', 'finans:duzenle',
    'belge:oku', 'belge:yukle', 'belge:sil',
    'gorev:oku', 'gorev:ekle', 'gorev:duzenle', 'gorev:sil',
    'takvim:oku', 'takvim:ekle', 'takvim:duzenle',
    'iletisim:oku', 'iletisim:ekle',
    'danismanlik:oku', 'danismanlik:ekle', 'danismanlik:duzenle',
    'rapor:oku', 'rapor:export',
    'audit:oku',
    'toplu:sil', 'toplu:export',
  ]),
  stajyer: new Set([
    'muvekkil:oku',
    'dosya:oku',
    'belge:oku',
    'gorev:oku', 'gorev:duzenle',
    'takvim:oku',
    'iletisim:oku',
    'danismanlik:oku',
    'rapor:oku',
  ]),
  sekreter: new Set([
    'muvekkil:oku',
    'dosya:oku',
    'belge:oku', 'belge:yukle',
    'gorev:oku', 'gorev:ekle', 'gorev:duzenle',
    'takvim:oku', 'takvim:ekle', 'takvim:duzenle',
    'iletisim:oku', 'iletisim:ekle',
    'danismanlik:oku',
    'rapor:oku',
    'toplu:export',
  ]),
};

// ── useRol — Kullanıcının rolünü döndürür ─────────────────────
export function useRol(): { rol: Rol | null; loading: boolean } {
  const [rol, setRol] = useState<Rol | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: kul } = await supabase
        .from('kullanicilar')
        .select('rol')
        .eq('auth_id', user.id)
        .single();

      const GECERLI_ROLLER: Rol[] = ['yonetici', 'avukat', 'stajyer', 'sekreter'];
      if (!cancelled) {
        if (kul?.rol && GECERLI_ROLLER.includes(kul.rol as Rol)) {
          setRol(kul.rol as Rol);
        } else {
          setRol('avukat'); // fallback only after fetch completes
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { rol, loading };
}

// ── useYetki — Belirli bir yetkiye sahip mi? ──────────────────
export function useYetki(yetki: string): { yetkili: boolean; loading: boolean } {
  const { rol, loading } = useRol();
  if (loading || !rol) return { yetkili: false, loading };
  return { yetkili: YETKI_HARITASI[rol]?.has(yetki) ?? false, loading: false };
}

// ── yetkiVar — Non-hook versiyon (rol biliniyorsa) ────────────
export function yetkiVar(rol: Rol, yetki: string): boolean {
  return YETKI_HARITASI[rol]?.has(yetki) ?? false;
}
