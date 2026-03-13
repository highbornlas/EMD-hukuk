'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Giriş yapmış kullanıcının buro_id'sini döndürür.
 * Vanilla JS ile aynı pattern: kullanicilar tablosundan auth_id ile çeker.
 */
export function useBuroId(): string | null {
  const [buroId, setBuroId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      // 1. Auth user'ı al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // 2. kullanicilar tablosundan buro_id çek (Vanilla JS ile aynı)
      const { data: kul } = await supabase
        .from('kullanicilar')
        .select('buro_id')
        .eq('auth_id', user.id)
        .single();

      if (!cancelled && kul?.buro_id) {
        setBuroId(kul.buro_id);
        return;
      }

      // 3. Fallback: user_metadata (kayıt sırasında set edilmişse)
      const fallback = user.user_metadata?.buro_id
        || user.app_metadata?.buro_id
        || null;
      if (!cancelled) setBuroId(fallback);
    })();

    return () => { cancelled = true; };
  }, []);

  return buroId;
}

/**
 * Kullanıcı bilgilerini döndürür (ad, rol, vb.)
 */
export function useKullanici() {
  const [kullanici, setKullanici] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: kul } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (!cancelled && kul) {
        setKullanici(kul);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return kullanici;
}
