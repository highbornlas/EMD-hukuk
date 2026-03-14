-- ================================================================
-- LEXBASE — AUDIT TRAIL (AKTİVİTE LOGU)
-- 014_audit_trail.sql
--
-- Kim, ne zaman, ne yaptı? Tüm kritik işlemler loglanır.
-- RLS: sadece okuma (log silinemez/değiştirilemez)
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. AUDIT LOG TABLOSU
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  buro_id uuid NOT NULL,
  kullanici_id text,
  aksiyon text NOT NULL,
  hedef_tur text NOT NULL,
  hedef_id text,
  detay jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_audit_log_buro ON audit_log (buro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_hedef ON audit_log (hedef_tur, hedef_id);

-- ════════════════════════════════════════════════════════════════
-- 2. RLS POLİTİKALARI (SADECE OKUMA)
-- ════════════════════════════════════════════════════════════════
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Büro kullanıcıları sadece kendi loglarını görebilir
CREATE POLICY "audit_log_select" ON audit_log FOR SELECT
  USING (buro_id = get_user_buro_id());

-- Insert: herkes kendi bürosuna log ekleyebilir
CREATE POLICY "audit_log_insert" ON audit_log FOR INSERT
  WITH CHECK (buro_id = get_user_buro_id());

-- UPDATE ve DELETE yok — loglar immutable

-- ════════════════════════════════════════════════════════════════
-- 3. ESKİ LOGLARI TEMİZLEME (OPSİYONEL pg_cron)
-- ════════════════════════════════════════════════════════════════
-- 90 günden eski logları siler (storage tasarrufu)
CREATE OR REPLACE FUNCTION fn_audit_temizle()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_log WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron ile her hafta pazar 03:00'da çalıştır
SELECT cron.unschedule('audit-temizle')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'audit-temizle'
);

SELECT cron.schedule(
  'audit-temizle',
  '0 3 * * 0',
  $$SELECT fn_audit_temizle()$$
);
