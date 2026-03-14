'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

/* ══════════════════════════════════════════════════════════════
   Çöp Kutusu Hook — Tüm soft-deleted kayıtları listeler
   ══════════════════════════════════════════════════════════════ */

export interface SilinenKayit {
  id: string;
  tablo: 'muvekkillar' | 'karsi_taraflar' | 'vekillar';
  tabloLabel: string;
  ad: string;
  tip?: string;
  silinmeTarihi: string;
  kalanSure: number; // ms cinsinden
}

const TABLO_LABELS: Record<string, string> = {
  muvekkillar: 'Müvekkil',
  karsi_taraflar: 'Karşı Taraf',
  vekillar: 'Avukat',
};

// Varsayılan saklama süresi: 24 saat (ms)
const VARSAYILAN_SAKLAMA_MS = 24 * 60 * 60 * 1000;

export function getCopKutusuSuresi(): number {
  if (typeof window === 'undefined') return VARSAYILAN_SAKLAMA_MS;
  const kayitli = localStorage.getItem('lb_cop_kutusu_sure');
  if (kayitli) return parseInt(kayitli, 10);
  return VARSAYILAN_SAKLAMA_MS;
}

export function setCopKutusuSuresi(ms: number) {
  localStorage.setItem('lb_cop_kutusu_sure', ms.toString());
}

export const SURE_SECENEKLERI = [
  { label: '1 saat', ms: 1 * 60 * 60 * 1000 },
  { label: '6 saat', ms: 6 * 60 * 60 * 1000 },
  { label: '12 saat', ms: 12 * 60 * 60 * 1000 },
  { label: '24 saat', ms: 24 * 60 * 60 * 1000 },
  { label: '3 gün', ms: 3 * 24 * 60 * 60 * 1000 },
  { label: '7 gün', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 gün', ms: 30 * 24 * 60 * 60 * 1000 },
];

export function useCopKutusu() {
  const buroId = useBuroId();

  return useQuery<SilinenKayit[]>({
    queryKey: ['cop-kutusu', buroId],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      const saklamaSuresi = getCopKutusuSuresi();
      const sonuc: SilinenKayit[] = [];

      const tablolar: Array<'muvekkillar' | 'karsi_taraflar' | 'vekillar'> = [
        'muvekkillar',
        'karsi_taraflar',
        'vekillar',
      ];

      for (const tablo of tablolar) {
        try {
          const { data } = await supabase
            .from(tablo)
            .select('id, data')
            .eq('buro_id', buroId);

          if (!data) continue;

          for (const row of data) {
            const d = row.data as Record<string, unknown>;
            if (!d._silindi) continue;

            const silinmeTarihi = d._silindi as string;
            const silinmeMs = new Date(silinmeTarihi).getTime();
            const kalanMs = saklamaSuresi - (Date.now() - silinmeMs);

            if (kalanMs <= 0) continue; // süresi dolmuş, gösterme

            sonuc.push({
              id: row.id,
              tablo,
              tabloLabel: TABLO_LABELS[tablo] || tablo,
              ad: ((d.ad as string) || '') + ((d.soyad as string) ? ' ' + (d.soyad as string) : ''),
              tip: d.tip as string | undefined,
              silinmeTarihi,
              kalanSure: kalanMs,
            });
          }
        } catch {
          // tablo yoksa devam
        }
      }

      // En son silineni üste
      sonuc.sort((a, b) => new Date(b.silinmeTarihi).getTime() - new Date(a.silinmeTarihi).getTime());
      return sonuc;
    },
    enabled: !!buroId,
    refetchInterval: 60000, // her dakika yenile (süre takibi için)
  });
}
