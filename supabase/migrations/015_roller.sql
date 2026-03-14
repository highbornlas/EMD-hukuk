-- ================================================================
-- LEXBASE — ROL & YETKİ SİSTEMİ
-- 015_roller.sql
--
-- Kullanıcılara rol atanır: yonetici, avukat, stajyer, sekreter
-- Varsayılan rol: avukat
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. KULLANICILAR TABLOSUNA ROL SÜTUNU EKLE
-- ════════════════════════════════════════════════════════════════
ALTER TABLE kullanicilar
  ADD COLUMN IF NOT EXISTS rol text DEFAULT 'avukat';

-- ════════════════════════════════════════════════════════════════
-- 2. KULLANICI ROL FONKSİYONU
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_get_user_rol()
RETURNS text AS $$
DECLARE
  v_rol text;
BEGIN
  SELECT rol INTO v_rol
  FROM kullanicilar
  WHERE auth_id = auth.uid()
  LIMIT 1;

  RETURN coalesce(v_rol, 'avukat');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ════════════════════════════════════════════════════════════════
-- 3. RLS GÜNCELLEMELERİ (Silme yetkileri)
-- ════════════════════════════════════════════════════════════════
-- Not: Mevcut RLS politikaları buro_id bazlı çalışıyor.
-- Rol bazlı kısıtlamalar client-side'da (YetkiKoruma bileşeni)
-- uygulanır. İleri aşamada RLS politikalarına rol kontrolü
-- eklenebilir:
--
-- Örnek (opsiyonel, şimdilik uygulanmıyor):
-- CREATE POLICY "muvekkil_delete_yonetici_avukat" ON muvekkillar
--   FOR DELETE USING (
--     buro_id = get_user_buro_id()
--     AND fn_get_user_rol() IN ('yonetici', 'avukat')
--   );
