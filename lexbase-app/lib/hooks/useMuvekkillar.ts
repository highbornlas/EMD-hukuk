'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

// ── Müvekkil Tip Tanımı ──────────────────────────────────────
export interface Muvekkil {
  id: string;
  sira?: number;
  tip?: 'gercek' | 'tuzel';
  ad: string;
  // Gerçek kişi
  tc?: string;
  dogum?: string;
  dogumYeri?: string;
  uyruk?: string;
  pasaport?: string;
  meslek?: string;
  // Tüzel kişi
  unvan?: string;
  sirketTur?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  mersis?: string;
  ticaretSicil?: string;
  yetkiliAd?: string;
  yetkiliUnvan?: string;
  yetkiliTc?: string;
  yetkiliTel?: string;
  // İletişim
  tel?: string;
  mail?: string;
  faks?: string;
  web?: string;
  uets?: string;
  adres?: Record<string, string>;
  // Finans
  bankalar?: Array<{
    banka?: string;
    sube?: string;
    iban?: string;
    hesapNo?: string;
    hesapAd?: string;
  }>;
  // Notlar
  not?: string;
  // İlişkiler
  iliskiler?: Array<{
    id: string;
    hedefId: string;
    tur: string;
    acik?: string;
  }>;
  [key: string]: unknown;
}

// ── Tüm Müvekkiller ──────────────────────────────────────────
export function useMuvekkillar() {
  const buroId = useBuroId();

  return useQuery<Muvekkil[]>({
    queryKey: ['muvekkillar', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('muvekkillar')
        .select('id, data')
        .eq('buro_id', buroId);

      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id, ...(r.data as object) })) as Muvekkil[];
    },
    enabled: !!buroId,
  });
}

// ── Tek Müvekkil (detay sayfası) ──────────────────────────────
export function useMuvekkil(id: string | null) {
  const buroId = useBuroId();

  return useQuery<Muvekkil | null>({
    queryKey: ['muvekkil', id, buroId],
    queryFn: async () => {
      if (!buroId || !id) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('muvekkillar')
        .select('id, data')
        .eq('buro_id', buroId)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      return { id: data.id, ...(data.data as object) } as Muvekkil;
    },
    enabled: !!buroId && !!id,
  });
}

// ── Müvekkile bağlı davalar ───────────────────────────────────
export function useMuvDavalar(muvId: string | null) {
  const buroId = useBuroId();

  return useQuery({
    queryKey: ['davalar', 'muv', muvId, buroId],
    queryFn: async () => {
      if (!buroId || !muvId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('davalar')
        .select('id, data')
        .eq('buro_id', buroId);

      if (error) throw error;
      return (data || [])
        .map((r) => ({ id: r.id, ...(r.data as object) }))
        .filter((d: Record<string, unknown>) => d.muvId === muvId);
    },
    enabled: !!buroId && !!muvId,
  });
}

// ── Müvekkile bağlı icra dosyaları ────────────────────────────
export function useMuvIcralar(muvId: string | null) {
  const buroId = useBuroId();

  return useQuery({
    queryKey: ['icra', 'muv', muvId, buroId],
    queryFn: async () => {
      if (!buroId || !muvId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('icra')
        .select('id, data')
        .eq('buro_id', buroId);

      if (error) throw error;
      return (data || [])
        .map((r) => ({ id: r.id, ...(r.data as object) }))
        .filter((i: Record<string, unknown>) => i.muvId === muvId);
    },
    enabled: !!buroId && !!muvId,
  });
}

// ── Kaydet (upsert) ───────────────────────────────────────────
export function useMuvekkilKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kayit: Muvekkil) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { id, ...data } = kayit;
      const { error } = await supabase.from('muvekkillar').upsert({
        id,
        buro_id: buroId,
        data,
      });
      if (error) throw error;
    },
    onMutate: async (yeniKayit) => {
      await queryClient.cancelQueries({ queryKey: ['muvekkillar'] });
      const onceki = queryClient.getQueryData<Muvekkil[]>(['muvekkillar', buroId]);
      queryClient.setQueryData<Muvekkil[]>(['muvekkillar', buroId], (eski = []) => {
        const idx = eski.findIndex((m) => m.id === yeniKayit.id);
        if (idx >= 0) {
          const yeni = [...eski];
          yeni[idx] = yeniKayit;
          return yeni;
        }
        return [...eski, yeniKayit];
      });
      return { onceki };
    },
    onError: (_err, _kayit, context) => {
      if (context?.onceki) {
        queryClient.setQueryData(['muvekkillar', buroId], context.onceki);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['muvekkillar'] });
      queryClient.invalidateQueries({ queryKey: ['muvekkil'] });
    },
  });
}

// ── Sil ───────────────────────────────────────────────────────
export function useMuvekkilSil() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { error } = await supabase
        .from('muvekkillar')
        .delete()
        .eq('id', id)
        .eq('buro_id', buroId);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['muvekkillar'] });
    },
  });
}
