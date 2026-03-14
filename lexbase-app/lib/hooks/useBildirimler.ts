'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

export interface Bildirim {
  id: string;
  buro_id: string;
  tip: string;     // 'durusma' | 'gorev' | 'dosya' | 'sure' | 'finans' | 'sistem'
  baslik: string;
  mesaj?: string;
  link?: string;
  okundu: boolean;
  olusturma: string;
}

/**
 * Bildirimleri çeker + Supabase Realtime ile dinler
 */
export function useBildirimler() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!buroId) return;

    const supabase = createClient();
    const channel = supabase
      .channel('bildirimler-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bildirimler',
          filter: `buro_id=eq.${buroId}`,
        },
        () => {
          // Yeni bildirim gelince query'yi invalidate et
          queryClient.invalidateQueries({ queryKey: ['bildirimler', buroId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buroId, queryClient]);

  return useQuery<Bildirim[]>({
    queryKey: ['bildirimler', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bildirimler')
        .select('*')
        .eq('buro_id', buroId)
        .order('olusturma', { ascending: false })
        .limit(50);

      if (error) {
        // Tablo yoksa boş dön (henüz migration yapılmamış olabilir)
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data || []) as Bildirim[];
    },
    enabled: !!buroId,
    staleTime: 30000, // 30 saniye
  });
}

/**
 * Tek bildirimi okundu olarak işaretle
 */
export function useBildirimOkundu() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { error } = await supabase
        .from('bildirimler')
        .update({ okundu: true })
        .eq('id', id)
        .eq('buro_id', buroId);
      if (error) throw error;
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['bildirimler', buroId] });
      const prev = queryClient.getQueryData<Bildirim[]>(['bildirimler', buroId]);
      if (prev) {
        queryClient.setQueryData(
          ['bildirimler', buroId],
          prev.map((b) => (b.id === id ? { ...b, okundu: true } : b))
        );
      }
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['bildirimler', buroId], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bildirimler', buroId] });
    },
  });
}

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export function useTumBildirimlerOku() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { error } = await supabase
        .from('bildirimler')
        .update({ okundu: true })
        .eq('buro_id', buroId)
        .eq('okundu', false);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['bildirimler', buroId] });
      const prev = queryClient.getQueryData<Bildirim[]>(['bildirimler', buroId]);
      if (prev) {
        queryClient.setQueryData(
          ['bildirimler', buroId],
          prev.map((b) => ({ ...b, okundu: true }))
        );
      }
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['bildirimler', buroId], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bildirimler', buroId] });
    },
  });
}
