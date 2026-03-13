'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

// ── İcra Tip Tanımı ──────────────────────────────────────────
export interface Icra {
  id: string;
  sira?: number;
  no?: string;
  muvId?: string;
  borclu?: string;
  btc?: string; // borçlu TC
  // Daire bilgileri
  il?: string;
  adliye?: string;
  daire?: string;
  esas?: string;
  // Tip & durum
  tur?: string; // İcra türü
  durum?: string; // 'Aktif' | 'Takipte' | 'Haciz Aşaması' | 'Satış Aşaması' | 'Kapandı'
  durumAciklama?: string;
  // Finansal
  alacak?: number;
  tahsil?: number;
  faiz?: number;
  atur?: string; // alacak türü
  // Tarihler
  tarih?: string;
  otarih?: string; // ödeme emri tarihi
  itarih?: string; // itiraz son tarihi
  itirazSonTarih?: string;
  // Taraflar
  muvRol?: string; // 'alacakli' | 'borclu'
  karsiIds?: string[];
  karsiAdlar?: string[];
  karsiId?: string;
  karsi?: string;
  karsavId?: string;
  karsav?: string;
  // İlişkiler
  davno?: string; // ilişkili dava numarası
  dayanak?: string;
  // Alt veriler
  evraklar?: Record<string, unknown>[];
  notlar?: Record<string, unknown>[];
  harcamalar?: Array<{ id: string; kat?: string; acik?: string; tarih?: string; tutar: number }>;
  tahsilatlar?: Array<{ id: string; tur: string; tutar: number; tarih?: string; acik?: string }>;
  anlasma?: Record<string, unknown>;
  not?: string;
  [key: string]: unknown;
}

// ── Tüm İcra Dosyaları ──────────────────────────────────────
export function useIcralar() {
  const buroId = useBuroId();

  return useQuery<Icra[]>({
    queryKey: ['icra', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('icra')
        .select('id, data')
        .eq('buro_id', buroId);

      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id, ...(r.data as object) })) as Icra[];
    },
    enabled: !!buroId,
  });
}

// ── Tek İcra (detay sayfası) ─────────────────────────────────
export function useIcra(id: string | null) {
  const buroId = useBuroId();

  return useQuery<Icra | null>({
    queryKey: ['icra-detay', id, buroId],
    queryFn: async () => {
      if (!buroId || !id) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('icra')
        .select('id, data')
        .eq('buro_id', buroId)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      return { id: data.id, ...(data.data as object) } as Icra;
    },
    enabled: !!buroId && !!id,
  });
}

// ── Kaydet (upsert) ──────────────────────────────────────────
export function useIcraKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kayit: Icra) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { id, ...data } = kayit;
      const { error } = await supabase.from('icra').upsert({
        id,
        buro_id: buroId,
        data,
      });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['icra'] });
      queryClient.invalidateQueries({ queryKey: ['icra-detay'] });
    },
  });
}

// ── Sil ──────────────────────────────────────────────────────
export function useIcraSil() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { error } = await supabase
        .from('icra')
        .delete()
        .eq('id', id)
        .eq('buro_id', buroId);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['icra'] });
    },
  });
}
