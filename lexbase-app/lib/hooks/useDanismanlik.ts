'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

export interface Danismanlik {
  id: string;
  tur?: string;
  muvId?: string;
  konu?: string;
  durum?: string; // Taslak, Devam Ediyor, Müvekkil Onayında, Gönderildi, Tamamlandı, İptal
  tarih?: string;
  teslimTarih?: string;
  ucret?: number;
  tahsilEdildi?: number;
  aciklama?: string;
  evraklar?: Record<string, unknown>[];
  notlar?: Record<string, unknown>[];
  [key: string]: unknown;
}

export function useDanismanliklar() {
  const buroId = useBuroId();

  return useQuery<Danismanlik[]>({
    queryKey: ['danismanlik', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('danismanlik')
        .select('id, data')
        .eq('buro_id', buroId);
      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id, ...(r.data as object) })) as Danismanlik[];
    },
    enabled: !!buroId,
  });
}

export function useDanismanlikKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kayit: Danismanlik) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { id, ...data } = kayit;
      const { error } = await supabase.from('danismanlik').upsert({ id, buro_id: buroId, data });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['danismanlik'] });
    },
  });
}
