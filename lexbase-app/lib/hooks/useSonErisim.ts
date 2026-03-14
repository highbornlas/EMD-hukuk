'use client';

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

/* ══════════════════════════════════════════════════════════════
   Son Erişim + Sabitlenmiş Dosyalar Hook
   Supabase tabanlı — cihazlar arası senkron
   ══════════════════════════════════════════════════════════════ */

export interface ErisimKayit {
  id: string;
  tip: 'dava' | 'icra' | 'muvekkil' | 'danismanlik' | 'arabuluculuk' | 'ihtarname';
  baslik: string;
  tarih: string;
}

interface SonErisimRow {
  id: string;
  kaynak_id: string;
  kaynak_tip: string;
  baslik: string;
  sabitlenen: boolean;
  erisim_zamani: string;
}

const MAX_KAYIT = 20;

/** Supabase satırını ErisimKayit'e dönüştür */
function rowToKayit(row: SonErisimRow): ErisimKayit {
  return {
    id: row.kaynak_id,
    tip: row.kaynak_tip as ErisimKayit['tip'],
    baslik: row.baslik,
    tarih: row.erisim_zamani,
  };
}

/** Auth uid'yi al (anlık) */
async function getAuthUid(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Son erişilen dosyalar + sabitlenmiş dosyalar
 * Supabase `son_erisimler` tablosu üzerinden çalışır.
 */
export function useSonErisim() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  /* ── Son erişimler (sabitlenen değil) ── */
  const { data: sonErisimler = [] } = useQuery<ErisimKayit[]>({
    queryKey: ['son-erisimler', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const uid = await getAuthUid();
      if (!uid) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from('son_erisimler')
        .select('id, kaynak_id, kaynak_tip, baslik, sabitlenen, erisim_zamani')
        .eq('buro_id', buroId)
        .eq('kullanici_auth_id', uid)
        .eq('sabitlenen', false)
        .order('erisim_zamani', { ascending: false })
        .limit(MAX_KAYIT);

      if (error) {
        if (error.code === '42P01') return []; // Tablo yoksa
        throw error;
      }
      return (data || []).map(rowToKayit);
    },
    enabled: !!buroId,
    staleTime: 60000, // 1 dakika
  });

  /* ── Sabitlenmiş dosyalar ── */
  const { data: sabitlenenler = [] } = useQuery<ErisimKayit[]>({
    queryKey: ['son-erisimler-sabitlenen', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const uid = await getAuthUid();
      if (!uid) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from('son_erisimler')
        .select('id, kaynak_id, kaynak_tip, baslik, sabitlenen, erisim_zamani')
        .eq('buro_id', buroId)
        .eq('kullanici_auth_id', uid)
        .eq('sabitlenen', true)
        .order('erisim_zamani', { ascending: false });

      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data || []).map(rowToKayit);
    },
    enabled: !!buroId,
    staleTime: 60000,
  });

  /* ── Erişim kaydet (UPSERT) ── */
  const kaydetMutation = useMutation({
    mutationFn: async (kayit: ErisimKayit) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const uid = await getAuthUid();
      if (!uid) throw new Error('Kullanıcı bulunamadı');

      const supabase = createClient();
      const { error } = await supabase
        .from('son_erisimler')
        .upsert(
          {
            buro_id: buroId,
            kullanici_auth_id: uid,
            kaynak_id: kayit.id,
            kaynak_tip: kayit.tip,
            baslik: kayit.baslik,
            erisim_zamani: new Date().toISOString(),
          },
          { onConflict: 'kullanici_auth_id,kaynak_id' }
        );
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['son-erisimler'] });
    },
  });

  /* ── Sabitle / kaldır toggle ── */
  const toggleMutation = useMutation({
    mutationFn: async (kayit: ErisimKayit) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const uid = await getAuthUid();
      if (!uid) throw new Error('Kullanıcı bulunamadı');

      const supabase = createClient();

      // Mevcut kaydı bul
      const { data: mevcut } = await supabase
        .from('son_erisimler')
        .select('id, sabitlenen')
        .eq('kullanici_auth_id', uid)
        .eq('kaynak_id', kayit.id)
        .single();

      if (mevcut) {
        // Toggle sabitlenen
        const { error } = await supabase
          .from('son_erisimler')
          .update({ sabitlenen: !mevcut.sabitlenen })
          .eq('id', mevcut.id);
        if (error) throw error;
      } else {
        // Yeni kayıt oluştur (sabitlenen olarak)
        const { error } = await supabase
          .from('son_erisimler')
          .insert({
            buro_id: buroId,
            kullanici_auth_id: uid,
            kaynak_id: kayit.id,
            kaynak_tip: kayit.tip,
            baslik: kayit.baslik,
            sabitlenen: true,
            erisim_zamani: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onMutate: async (kayit) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['son-erisimler-sabitlenen', buroId] });
      const prev = queryClient.getQueryData<ErisimKayit[]>(['son-erisimler-sabitlenen', buroId]);

      if (prev) {
        const isSabitlenen = prev.some((s) => s.id === kayit.id);
        if (isSabitlenen) {
          queryClient.setQueryData(['son-erisimler-sabitlenen', buroId], prev.filter((s) => s.id !== kayit.id));
        } else {
          queryClient.setQueryData(['son-erisimler-sabitlenen', buroId], [{ ...kayit, tarih: new Date().toISOString() }, ...prev]);
        }
      }
      return { prev };
    },
    onError: (_err, _kayit, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['son-erisimler-sabitlenen', buroId], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['son-erisimler'] });
      queryClient.invalidateQueries({ queryKey: ['son-erisimler-sabitlenen'] });
    },
  });

  /* ── Helper fonksiyonlar (aynı interface) ── */
  const kaydetErisim = useCallback(
    (kayit: ErisimKayit) => { kaydetMutation.mutate(kayit); },
    [kaydetMutation]
  );

  const toggleSabitle = useCallback(
    (kayit: ErisimKayit) => { toggleMutation.mutate(kayit); },
    [toggleMutation]
  );

  const isSabitlenen = useCallback(
    (id: string) => sabitlenenler.some((s) => s.id === id),
    [sabitlenenler]
  );

  return {
    sonErisimler,
    sabitlenenler,
    kaydetErisim,
    toggleSabitle,
    isSabitlenen,
  };
}
