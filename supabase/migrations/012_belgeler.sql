-- ================================================================
-- LEXBASE — BELGELER TABLOsu + STORAGE
-- 012_belgeler.sql
--
-- 1. belgeler tablosu (meta veri — dosya bilgileri, etiketler)
-- 2. Supabase Storage bucket: belgeler
-- 3. Yeni belge eklendiğinde bildirim trigger
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. BELGELER TABLOSU
-- ════════════════════════════════════════════════════════════════
-- JSONB data yapısı:
-- {
--   muvId: string,
--   ad: string,
--   tur: 'vekaletname' | 'sozlesme' | 'kimlik' | 'sirkuler' | 'makbuz' | 'diger',
--   tarih: string (YYYY-MM-DD),
--   dosyaAd: string (orijinal dosya adı),
--   tip: string (mime type),
--   boyut: number (byte),
--   storagePath: string (Supabase Storage path),
--   etiketler: string[],
--   meta: {
--     -- vekaletname özel alanları:
--     bitis: string (YYYY-MM-DD),
--     noter: string,
--     yevmiye: string,
--     vekil: string,
--     ozel: boolean,
--     ozelAcik: string,
--   }
-- }

CREATE TABLE IF NOT EXISTS belgeler (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  buro_id     uuid NOT NULL,
  data        jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_belgeler_buro
  ON belgeler(buro_id);
CREATE INDEX IF NOT EXISTS idx_belgeler_muv
  ON belgeler(buro_id, (data->>'muvId'));
CREATE INDEX IF NOT EXISTS idx_belgeler_tur
  ON belgeler(buro_id, (data->>'tur'));

ALTER TABLE belgeler ENABLE ROW LEVEL SECURITY;

-- RLS politikaları
DO $$ BEGIN
  CREATE POLICY belgeler_sel ON belgeler FOR SELECT
    USING (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY belgeler_ins ON belgeler FOR INSERT
    WITH CHECK (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY belgeler_upd ON belgeler FOR UPDATE
    USING (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY belgeler_del ON belgeler FOR DELETE
    USING (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ════════════════════════════════════════════════════════════════
-- 2. SUPABASE STORAGE BUCKET
-- ════════════════════════════════════════════════════════════════
-- Not: Supabase Storage bucket'ları SQL ile oluşturulamaz.
-- Dashboard > Storage > New Bucket > "belgeler" (private) olarak oluşturun.
-- Ardından bu Storage Policy'leri Dashboard'dan ekleyin:
--
-- SELECT: authenticated users, path starts with buro_id
-- INSERT: authenticated users, path starts with buro_id
-- DELETE: authenticated users, path starts with buro_id


-- ════════════════════════════════════════════════════════════════
-- 3. YENİ BELGE BİLDİRİM TRIGGER
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_bildirim_yeni_belge()
RETURNS trigger AS $$
DECLARE
  belge_tur text;
  belge_ad text;
BEGIN
  belge_tur := COALESCE(NEW.data->>'tur', 'belge');
  belge_ad := COALESCE(NEW.data->>'ad', NEW.data->>'dosyaAd', 'Yeni belge');

  INSERT INTO bildirimler (buro_id, tip, baslik, mesaj, link)
  VALUES (
    NEW.buro_id,
    'belge',
    CASE WHEN belge_tur = 'vekaletname' THEN 'Yeni vekaletname eklendi'
         ELSE 'Yeni belge yüklendi' END,
    belge_ad,
    '/muvekkillar/' || COALESCE(NEW.data->>'muvId', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bildirim_yeni_belge ON belgeler;
CREATE TRIGGER trg_bildirim_yeni_belge
  AFTER INSERT ON belgeler
  FOR EACH ROW
  EXECUTE FUNCTION fn_bildirim_yeni_belge();
