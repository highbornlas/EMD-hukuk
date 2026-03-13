'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

export interface Todo {
  id: string;
  baslik?: string;
  aciklama?: string;
  oncelik?: 'Yüksek' | 'Orta' | 'Düşük';
  durum?: 'Bekliyor' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal';
  sonTarih?: string;
  atananId?: string;
  muvId?: string;
  dosyaTur?: string;
  dosyaId?: string;
  olusturanId?: string;
  olusturmaTarih?: string;
  tamamlanmaTarih?: string;
  tamamlamaAciklama?: string;
  [key: string]: unknown;
}

export function useTodolar() {
  const buroId = useBuroId();

  return useQuery<Todo[]>({
    queryKey: ['todolar', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('todolar')
        .select('id, data')
        .eq('buro_id', buroId);
      if (error) throw error;
      return (data || []).map((r) => ({ id: r.id, ...(r.data as object) })) as Todo[];
    },
    enabled: !!buroId,
  });
}

export function useTodoKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kayit: Todo) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { id, ...data } = kayit;
      const { error } = await supabase.from('todolar').upsert({ id, buro_id: buroId, data });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todolar'] });
    },
  });
}

export function useTodoSil() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { error } = await supabase.from('todolar').delete().eq('id', id).eq('buro_id', buroId);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todolar'] });
    },
  });
}
