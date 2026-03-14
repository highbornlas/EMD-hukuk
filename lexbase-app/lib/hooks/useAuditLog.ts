'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBuroId } from './useBuro';

/* ══════════════════════════════════════════════════════════════
   Audit Log Hook — Kim ne yaptı logu
   ══════════════════════════════════════════════════════════════ */

export interface AuditEntry {
  id: number;
  kullaniciId: string;
  aksiyon: string;
  hedefTur: string;
  hedefId: string;
  detay: Record<string, unknown>;
  createdAt: string;
}

export type AuditAksiyon = 'create' | 'update' | 'delete' | 'upload' | 'download' | 'login' | 'logout';
export type AuditHedefTur = 'muvekkil' | 'dava' | 'icra' | 'belge' | 'gorev' | 'etkinlik' | 'danismanlik' | 'iletisim' | 'karsi_taraf' | 'vekil';

interface AuditFiltre {
  hedefTur?: string;
  limit?: number;
  offset?: number;
}

// ── Audit logları çek ─────────────────────────────────────────
export function useAuditLog(filtre?: AuditFiltre) {
  const buroId = useBuroId();
  const limit = filtre?.limit || 50;
  const offset = filtre?.offset || 0;

  return useQuery<AuditEntry[]>({
    queryKey: ['audit-log', buroId, filtre?.hedefTur, limit, offset],
    queryFn: async () => {
      if (!buroId) return [];
      const supabase = createClient();
      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('buro_id', buroId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filtre?.hedefTur) {
        query = query.eq('hedef_tur', filtre.hedefTur);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((r) => ({
        id: r.id,
        kullaniciId: r.kullanici_id,
        aksiyon: r.aksiyon,
        hedefTur: r.hedef_tur,
        hedefId: r.hedef_id,
        detay: r.detay || {},
        createdAt: r.created_at,
      }));
    },
    enabled: !!buroId,
  });
}

// ── Audit log kaydet ──────────────────────────────────────────
export function useAuditKaydet() {
  const buroId = useBuroId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      aksiyon: AuditAksiyon;
      hedefTur: AuditHedefTur;
      hedefId?: string;
      detay?: Record<string, unknown>;
    }) => {
      if (!buroId) return;
      const supabase = createClient();

      // Kullanıcı ID'sini al
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('audit_log').insert({
        buro_id: buroId,
        kullanici_id: user?.id || 'system',
        aksiyon: entry.aksiyon,
        hedef_tur: entry.hedefTur,
        hedef_id: entry.hedefId || null,
        detay: entry.detay || {},
      });

      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-log'] });
    },
  });
}

// ── withAudit wrapper — mevcut mutation'ları saran utility ────
export function useAuditWrapper() {
  const auditKaydet = useAuditKaydet();

  return {
    logCreate: (hedefTur: AuditHedefTur, hedefId: string, detay?: Record<string, unknown>) => {
      auditKaydet.mutate({ aksiyon: 'create', hedefTur, hedefId, detay });
    },
    logUpdate: (hedefTur: AuditHedefTur, hedefId: string, detay?: Record<string, unknown>) => {
      auditKaydet.mutate({ aksiyon: 'update', hedefTur, hedefId, detay });
    },
    logDelete: (hedefTur: AuditHedefTur, hedefId: string, detay?: Record<string, unknown>) => {
      auditKaydet.mutate({ aksiyon: 'delete', hedefTur, hedefId, detay });
    },
    logUpload: (hedefId: string, detay?: Record<string, unknown>) => {
      auditKaydet.mutate({ aksiyon: 'upload', hedefTur: 'belge', hedefId, detay });
    },
    logDownload: (hedefId: string, detay?: Record<string, unknown>) => {
      auditKaydet.mutate({ aksiyon: 'download', hedefTur: 'belge', hedefId, detay });
    },
  };
}
