-- ================================================================
-- LEXBASE — TÜM TABLOLAR İÇİN RLS POLİTİKALARI
-- 004_rls_policies.sql
--
-- Kullanıcı sadece kendi bürosunun verisini görebilir/yazabilir.
-- Doğrudan Supabase SQL Editor'de çalıştırın.
-- ================================================================

-- Tüm tablolar için tek fonksiyon — kullanıcının buro_id'sini döndürür
CREATE OR REPLACE FUNCTION get_user_buro_id()
RETURNS uuid AS $$
  SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Makro: Bir tablo için 4 RLS policy oluştur ──────────────
DO $$ 
DECLARE
  tablo_adi text;
  tablolar text[] := ARRAY[
    'muvekkillar', 'karsi_taraflar', 'vekillar',
    'davalar', 'icra', 'butce', 'avanslar',
    'etkinlikler', 'danismanlik', 'arabuluculuk',
    'ihtarnameler', 'todolar', 'personel'
  ];
BEGIN
  FOREACH tablo_adi IN ARRAY tablolar LOOP
    -- RLS aktifleştir
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tablo_adi);
    
    -- SELECT
    BEGIN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR SELECT USING (buro_id = get_user_buro_id())',
        tablo_adi || '_sel', tablo_adi
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    -- INSERT
    BEGIN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (buro_id = get_user_buro_id())',
        tablo_adi || '_ins', tablo_adi
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    -- UPDATE
    BEGIN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR UPDATE USING (buro_id = get_user_buro_id())',
        tablo_adi || '_upd', tablo_adi
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    -- DELETE
    BEGIN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR DELETE USING (buro_id = get_user_buro_id())',
        tablo_adi || '_del', tablo_adi
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    RAISE NOTICE 'RLS policies created for: %', tablo_adi;
  END LOOP;
END $$;

-- ================================================================
-- DOĞRULAMA
-- ================================================================
-- Bu sorgu ile tüm tabloların RLS durumunu kontrol edin:
SELECT 
  schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'muvekkillar', 'karsi_taraflar', 'vekillar',
    'davalar', 'icra', 'butce', 'avanslar',
    'etkinlikler', 'danismanlik', 'arabuluculuk',
    'ihtarnameler', 'todolar', 'personel'
  )
ORDER BY tablename;
