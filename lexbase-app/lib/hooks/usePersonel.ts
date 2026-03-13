'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

export interface Personel {
  id: string;
  ad?: string;
  rol?: 'sahip' | 'avukat' | 'stajyer' | 'sekreter';
  email?: string;
  tel?: string;
  tc?: string;
  baroSicil?: string;
  baslama?: string;
  durum?: 'aktif' | 'davet_gonderildi' | 'pasif';
  notlar?: string;
  yetkiler?: Record<string, string>;
  [key: string]: unknown;
}

export function usePersoneller() {
  const buroId = useBuroId();

  return useQuery<Personel[]>({
    queryKey: ['personel', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('personel')
        .select('id, data')
        .eq('buro_id', buroId);
      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id, ...(r.data as object) })) as Personel[];
    },
    enabled: !!buroId,
  });
}

export function usePersonelKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kayit: Personel) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { id, ...data } = kayit;
      const { error } = await supabase.from('personel').upsert({ id, buro_id: buroId, data });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
    },
  });
}
