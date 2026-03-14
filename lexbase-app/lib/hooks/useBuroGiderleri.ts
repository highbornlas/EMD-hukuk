'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

// ── Büro Gideri Tip Tanımı ──────────────────────────────────
export interface BuroGider {
  id: string;
  tarih?: string;
  kategori?: string;
  aciklama?: string;
  tutar?: number;
  kdvOrani?: number;      // KDV oranı (%, 0/1/10/20)
  kdvTutar?: number;      // KDV tutarı
  stopajOrani?: number;   // Stopaj oranı (%)
  stopajTutar?: number;   // Stopaj tutarı
  netTutar?: number;      // Net ödenen tutar
  tekrar?: 'tek' | 'aylik' | 'yillik'; // Tekrarlı gider mi
  belgeNo?: string;       // Fatura/belge no
  odemeDurumu?: 'odendi' | 'bekliyor' | 'gecikti';
  odenmeTarih?: string;
  notlar?: string;
  _silindi?: string;
  [key: string]: unknown;
}

export const GIDER_KATEGORILERI = [
  'Kira',
  'Stopaj',
  'Mali Müşavir',
  'Personel Ücreti',
  'SGK Primi',
  'Temizlik',
  'Kırtasiye',
  'Teknoloji / Yazılım',
  'Ulaşım',
  'Sigorta',
  'Elektrik / Su / Doğalgaz',
  'İletişim (Telefon/İnternet)',
  'Mesleki Gelişim / Eğitim',
  'Baro Aidatı',
  'Temsil / Ağırlama',
  'Diğer',
] as const;

export const KDV_ORANLARI = [0, 1, 10, 20] as const;

// ── Tüm Büro Giderleri ──────────────────────────────────────
export function useBuroGiderleri() {
  const buroId = useBuroId();

  return useQuery<BuroGider[]>({
    queryKey: ['buro-giderleri', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('buro_giderleri')
        .select('id, data')
        .eq('buro_id', buroId);

      if (error) throw error;
      return (data || [])
        .map((r) => ({ id: r.id, ...(r.data as object) }) as BuroGider)
        .filter((g) => !g._silindi);
    },
    enabled: !!buroId,
  });
}

// ── Kaydet (upsert) — optimistic update ─────────────────────
export function useBuroGiderKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kayit: BuroGider) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();
      const { id, ...data } = kayit;
      const { error } = await supabase.from('buro_giderleri').upsert({
        id,
        buro_id: buroId,
        data,
      });
      if (error) throw error;
    },
    onMutate: async (yeni) => {
      await queryClient.cancelQueries({ queryKey: ['buro-giderleri', buroId] });
      const onceki = queryClient.getQueryData<BuroGider[]>(['buro-giderleri', buroId]);

      queryClient.setQueryData<BuroGider[]>(['buro-giderleri', buroId], (eski) => {
        if (!eski) return [yeni];
        const idx = eski.findIndex((g) => g.id === yeni.id);
        if (idx >= 0) {
          const klon = [...eski];
          klon[idx] = yeni;
          return klon;
        }
        return [...eski, yeni];
      });

      return { onceki };
    },
    onError: (_err, _yeni, ctx) => {
      if (ctx?.onceki) {
        queryClient.setQueryData(['buro-giderleri', buroId], ctx.onceki);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['buro-giderleri'] });
      queryClient.invalidateQueries({ queryKey: ['finans'] });
    },
  });
}

// ── Sil (soft delete) ───────────────────────────────────────
export function useBuroGiderSil() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gider: BuroGider) => {
      if (!buroId) throw new Error('Büro bulunamadı');
      const supabase = createClient();

      const { data: mevcut } = await supabase
        .from('buro_giderleri')
        .select('data')
        .eq('id', gider.id)
        .single();

      const mevcutData = (mevcut?.data as object) || {};
      const { error } = await supabase.from('buro_giderleri').upsert({
        id: gider.id,
        buro_id: buroId,
        data: { ...mevcutData, _silindi: new Date().toISOString() },
      });
      if (error) throw error;
    },
    onMutate: async (gider) => {
      await queryClient.cancelQueries({ queryKey: ['buro-giderleri', buroId] });
      const onceki = queryClient.getQueryData<BuroGider[]>(['buro-giderleri', buroId]);

      queryClient.setQueryData<BuroGider[]>(['buro-giderleri', buroId], (eski) =>
        (eski || []).filter((g) => g.id !== gider.id)
      );

      return { onceki };
    },
    onError: (_err, _yeni, ctx) => {
      if (ctx?.onceki) {
        queryClient.setQueryData(['buro-giderleri', buroId], ctx.onceki);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['buro-giderleri'] });
      queryClient.invalidateQueries({ queryKey: ['finans'] });
    },
  });
}
