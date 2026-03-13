'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

export interface Etkinlik {
  id: string;
  baslik?: string;
  tarih?: string;
  saat?: string;
  tur?: string; // Duruşma, Son Gün, Müvekkil Görüşmesi, Toplantı, Keşif, Bilirkişi, Arabuluculuk, Uzlaşma, Diğer
  muvId?: string;
  davNo?: string;
  yer?: string;
  not?: string;
  hatirlatma?: string;
  [key: string]: unknown;
}

export function useEtkinlikler() {
  const buroId = useBuroId();

  return useQuery<Etkinlik[]>({
    queryKey: ['etkinlikler', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('etkinlikler')
        .select('id, data')
        .eq('buro_id', buroId);
      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id, ...(r.data as object) })) as Etkinlik[];
    },
    enabled: !!buroId,
  });
}

export function useEtkinlikKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kayit: Etkinlik) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { id, ...data } = kayit;
      const { error } = await supabase.from('etkinlikler').upsert({ id, buro_id: buroId, data });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['etkinlikler'] });
    },
  });
}

export function useEtkinlikSil() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { error } = await supabase.from('etkinlikler').delete().eq('id', id).eq('buro_id', buroId);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['etkinlikler'] });
    },
  });
}
